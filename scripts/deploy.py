#!/usr/bin/env python3
"""Run on dev1: python3 scripts/deploy.py RELEASE

RELEASE looks like <short-sha>-<yyyymmdd>; the image
ghcr.io/waylake/inferaft-character:RELEASE must already exist, built and pushed
from exactly that commit by the Release workflow. This script only pulls the
image, applies additive migrations, restarts the service behind a health gate
and rolls back to the previous release when the gate fails. It never touches
the PostgreSQL container or its volume.
"""
import argparse
import fcntl
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATE = ROOT / ".deploy"
PORT = 3084
PROJECT = "inferaft-character"
IMAGE = "ghcr.io/waylake/inferaft-character"
RELEASE_RE = r"^[0-9a-f]{7}-\d{8}$"


def run(*args, capture=False, env=None):
    return subprocess.run(args, cwd=ROOT, check=True, text=True,
                          stdout=subprocess.PIPE if capture else None, env=env).stdout


def compose(release, *args, capture=False):
    # RELEASE_ID/WEB_PORT/IMAGE_BASE are what compose.app.yaml interpolates.
    env = {**os.environ, "RELEASE_ID": release, "WEB_PORT": str(PORT), "IMAGE_BASE": IMAGE}
    return run("docker", "compose", "--env-file", ".env.production", "-p", PROJECT,
               "-f", "compose.app.yaml", *args, capture=capture, env=env)


def load_state():
    state = STATE / "state.json"
    return json.loads(state.read_text()) if state.exists() else {}


def save_state(release):
    STATE.mkdir(exist_ok=True)
    (STATE / "state.json").write_text(json.dumps({"release": release}, indent=2) + "\n")


def image_present(release):
    tags = run("docker", "images", "--format", "{{.Tag}}", f"{IMAGE}", capture=True)
    return release in tags.split()


def healthy(timeout=90):
    """The app's own healthcheck plus one real request through the published port."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        status = run("docker", "inspect", "--format", "{{.State.Health.Status}}",
                     f"{PROJECT}-web-1", capture=True).strip()
        if status == "unhealthy":
            return False
        if status == "healthy":
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/", timeout=10) as r:
                    return r.status == 200
            except (urllib.error.URLError, TimeoutError):
                pass
        time.sleep(3)
    return False


def container_logs(tail=40):
    return run("docker", "logs", "--tail", str(tail), f"{PROJECT}-web-1", capture=True)


def migrate(release):
    # Additive migrations run before the switch; the old release keeps serving.
    compose(release, "run", "--rm", "--no-deps", "-T", "--entrypoint", "node", "web",
            "scripts/migrate.mjs")
    print(f"[deploy] migrations applied for {release}")


def up(release, attempt_label="primary"):
    run("docker", "tag", f"{IMAGE}:{release}", f"{IMAGE}:current")
    compose(release, "up", "-d", "--wait", "--wait-timeout", "120", "web")
    if healthy():
        save_state(release)
        print(f"[deploy] {release} healthy on 127.0.0.1:{PORT} ({attempt_label})")
        return True
    print(f"[deploy] {release} FAILED the health gate ({attempt_label})", file=sys.stderr)
    print(container_logs(), file=sys.stderr)
    return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("release")
    args = parser.parse_args()
    release = args.release

    import re
    if not re.match(RELEASE_RE, release):
        sys.exit(f"release id must look like <sha7>-<yyyymmdd>, got {release!r}")

    STATE.mkdir(exist_ok=True)
    with open(STATE / "deploy.lock", "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        previous = load_state().get("release")

        if not image_present(release):
            print(f"[deploy] pulling {IMAGE}:{release}")
            run("docker", "pull", f"{IMAGE}:{release}")

        migrate(release)

        if up(release):
            run("docker", "image", "prune", "-f", capture=True)
            print(f"[deploy] done: {release}")
            return

        if previous and previous != release:
            print(f"[deploy] rolling back to {previous}", file=sys.stderr)
            if up(previous, "rollback"):
                print("[deploy] rollback healthy; the new release is parked", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
