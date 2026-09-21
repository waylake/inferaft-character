# PoC roadmap

## Slice 0 — current repository
- landing
- Better Auth signup/login
- seeded discovery
- chat persistence
- Inferaft streaming
- deterministic lore activation
- Zep integration hook

## Slice 1 — continuity quality
- move the in-request summary updater into a durable worker and add an inspection UI
- explicit memory editor
- persona editor
- reroll/swipes as variants
- prompt inspector for creator/debug mode
- evaluation fixture: 20 scripted continuity/lore tests

## Slice 2 — portability
- CCv3 JSON import/export
- PNG metadata import
- CHARX import/export
- preserve unknown `extensions`
- SillyTavern/Risu conformance fixtures

## Slice 3 — image scenes
- character visual profile
- scene prompt compiler from current state
- `/v1/images/generations` via Inferaft
- generated image gallery per conversation
- consistency evaluation

## Slice 4 — creator MVP
- character editor
- lorebook editor
- draft/private/link/public visibility
- tags and search
- basic creator analytics: detail -> chat-open conversion

## Explicitly deferred
- follower/comment social graph
- marketplace payouts
- TTS/voice cloning
- paid episodes
- recommendation ML
- mobile apps
