import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 renamed middleware to proxy. This is an *optimistic* check only:
 * it reads the session cookie and never touches the database, because proxy runs
 * on every matched request including prefetches.
 *
 * It deliberately does NOT bounce signed-in users away from /login or /signup —
 * a stale or emptied cookie would otherwise lock a user out of the login screen.
 * The auth pages do the real (database-backed) check themselves.
 */
const PROTECTED = ["/chat"];
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));

  if (!hasSession && PROTECTED.some((prefix) => pathname.startsWith(prefix))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/chat/:path*"] };
