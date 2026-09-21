# Storydeck / Inferaft Character Chat PoC

A separate consumer character-chat web app that uses **Inferaft** as its model backend. The repository intentionally does not merge character/community product logic into the Inferaft core API product.

## What works in the PoC

- Landing page
- Email/password sign-up and login using Better Auth + PostgreSQL
- Seeded character discovery page
- Character chat with streaming through Inferaft's OpenAI-compatible API
- CCv3-shaped lorebook data model and selective lore activation
- Layered context: recent turns + pinned notes + scene summary + narrative summary + Zep temporal memory
- Optional local mock mode so UI/auth can be tested without spending inference

## Stack

- Bun 1.3 (install + runner; `next dev`/`next build` still run on Node)
- Next.js 16.3.5 / React 19.2.8 / TypeScript 5.9
- Tailwind CSS 4
- Better Auth 1.7.4 + PostgreSQL 17
- Vercel AI SDK 6 + `@ai-sdk/openai`, pointed at `INFERAFT_API_URL`
- Zep V3 via `@getzep/zep-cloud` and the official `@getzep/zep-vercel-ai` integration
- Zod 4

This deliberately mirrors the modern parts of `waylake/inferaft` while keeping the consumer product deployable independently.

## Run

```bash
cp .env.example .env.local
docker compose up -d
bun install
bunx auth@latest migrate --yes
bun run db:migrate
bun run db:seed
bun run dev
```

Open http://localhost:3000, sign up, select a character, and chat.

For real inference:

```env
INFERAFT_API_URL=https://inferaft.com/v1
INFERAFT_API_KEY=...
INFERAFT_CHAT_MODEL=...
INFERAFT_MOCK=false
```

For long-term temporal memory, set `ZEP_API_KEY`. The app still works without it; PostgreSQL summaries/notes remain the deterministic narrative memory layer while Zep supplies semantic cross-turn recall.

## Memory architecture

Do **not** collapse every kind of memory into one vector search. Character roleplay has different memory classes with different failure modes:

1. **Recent turns** — exact transcript, small sliding window.
2. **Current scene summary** — where everyone is, active goals, current emotional/physical state.
3. **Narrative summary** — compressed sequence of durable events and relationship changes.
4. **Pinned/user-authored memory** — explicit facts that should not be silently rewritten by a summarizer.
5. **Zep temporal memory** — retrieved historical facts/entities/relationships with temporal context.
6. **Lorebook** — creator-authored world/character facts activated by keys/regex/priority and a token budget; this is not user memory.

The POC schema already separates these layers. `docs/PRODUCT-RESEARCH.md` explains the reasoning and competitor patterns.

## Next implementation slices

- Add a memory inspection/editor UI and decouple summary generation into a durable worker before production scale.
- Character Card V3 JSON/PNG/CHARX import/export.
- Persona editor and persona-bound lorebook.
- Reroll/swipes implemented as message variants rather than duplicate chronology.
- Image-scene generation through Inferaft `/v1/images/generations`, with a character visual profile and prompt compiler.
- Creator UI, search/ranking and community only after retention/quality tests validate the chat core.
