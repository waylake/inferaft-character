# Character-chat product research and PoC plan

Updated: 2026-09-21

## Product boundary

Keep **Inferaft** as the provider-neutral inference, usage and billing core. Build the character product as a separate consumer app that calls Inferaft. This avoids contaminating the API product with character-specific state, moderation, creator discovery, lore editing, social features and consumer UX.

The consumer app can later expose its own plans while Inferaft remains the internal cost/control plane. Power users may still connect SillyTavern/Risu directly to Inferaft; mainstream users get a zero-configuration web product.

## Competitive patterns worth copying (not cloning)

### CaveDuck

Observed 2026 behavior:

- Character discovery is a first-class product surface: recommended, new, trending/popular, tags and world-based browsing.
- Persona is explicit and editable per chat.
- Multiple models and output-length choices are visible to the user/creator.
- Creator "expert mode" includes a lorebook, recommended persona guidance, recommended model/output settings, prompt inspection and custom presentation fields.
- In March 2026 CaveDuck replaced a monolithic long-term-memory concept with a clearer stack: recent conversation + current-conversation summary + whole-narrative summary. User-authored notes remain a separate explicit channel.
- It also has chat sharing, episodes, albums/media, TTS and creator widgets. Those are engagement layers, not PoC requirements.

Product lesson: continuity quality is a visible product feature; memory needs user inspection/editability, not an invisible black box.

### SillyTavern

SillyTavern is the power-user reference architecture for prompt assembly rather than a hosted model vendor. Its World Info/Lorebook engine:

- activates entries using keys (or embedding similarity in advanced modes),
- supports character/persona/chat/global scopes,
- controls insertion order and insertion position,
- uses scan depth and a token budget,
- allows constant entries and recursive activation,
- keeps lore separate from character-card identity fields.

Product lesson: lore is **conditional creator-authored context**, not "memory". Treating it as RAG-only loses deterministic behavior creators expect.

### RisuAI / Chub ecosystem

The same character-card/lorebook conventions appear across Risu, Chub, Janitor-style frontends and SillyTavern-compatible cards. Portability matters because established creators already have cards and lorebooks. A new service should ingest their existing work instead of demanding re-authoring.

### Character Card V3

CCv3 standardizes a character-specific `character_book` and richer lorebook semantics while preserving forward compatibility through `extensions`. JSON and CHARX are explicit interchange formats; V3-aware PNG metadata is also common.

Product lesson: use CCv3 as the external contract. Store normalized relational data internally if useful, but preserve unknown extension fields during import/export.

## Memory decision

### Why Zep V3

The PoC uses Zep's current V3 TypeScript stack because:

- it is a maintained, purpose-built temporal context graph rather than a homegrown embedding table,
- it has an official Vercel AI SDK 6 integration,
- it models facts/entities/episodes/thread summaries and temporal relationships,
- the integration degrades gracefully if Zep is unavailable,
- it can later support user-level memory across multiple character threads while keeping thread context distinct.

Zep is **not** used for authoritative world lore or the canonical chat transcript. PostgreSQL remains the durable source of truth.

### Layered memory policy

Prompt assembly order for the PoC target:

1. immutable platform safety/product contract,
2. relevant lore that belongs before character definitions,
3. character identity/personality/scenario,
4. persona,
5. relevant lore after character definitions,
6. pinned user/creator notes,
7. current scene summary,
8. long-range narrative summary,
9. retrieved Zep context framed as untrusted historical context,
10. examples,
11. recent exact messages,
12. post-history instructions.

Conflict resolution: newest explicit user statement > recent transcript > pinned explicit notes > summaries > retrieved long-term memory > lore only for factual world rules. A memory system must not silently override fresh user corrections.

## Lorebook semantics for v1

Implement the interoperable core first:

- `keys[]`, `secondary_keys[]`
- `constant`
- `selective`
- case sensitivity
- regex
- enabled flag
- insertion order / priority
- before/after-character placement
- scan depth
- token budget
- opaque `extensions`

Later add recursive scanning and CCv3 decorators only after conformance tests against real exported cards.

## PoC success test

A new user must be able to:

1. land on the product,
2. create an account,
3. see a small curated character catalog,
4. open a character,
5. send a message and receive a streamed response from Inferaft,
6. mention a lore trigger and see the model correctly use that detail,
7. continue long enough for memory summaries to appear,
8. return to the conversation without continuity resetting.

Only after this works reliably should the product add creator marketplace, follows/comments, ranking, paid episodes, TTS or full social feeds.

## Research sources

- SillyTavern World Info docs: https://github.com/SillyTavern/SillyTavern-Docs/blob/main/Usage/worldinfo.md
- Character Card V3 spec: https://github.com/kwaroran/character-card-spec-v3/blob/main/SPEC_V3.md
- RisuAI lorebook wiki: https://github.com/kwaroran/RisuAI/wiki/Lorebook
- CaveDuck expert mode / lorebook docs: https://docs.caveduck.io/ko/articles/%EC%A0%84%EB%AC%B8%EA%B0%80-%EB%AA%A8%EB%93%9C-%EB%B0%94%EB%A1%9C-%EC%95%8C%EA%B8%B0-6af29a01
- CaveDuck memory update (2026-03-27): https://caveduck.io/ko/notice/373
- Zep V3 + Vercel AI SDK integration: https://help.getzep.com/vercel-ai-memory
- Better Auth PostgreSQL adapter: https://better-auth.com/docs/adapters/postgresql
- Vercel AI SDK: https://ai-sdk.dev/

### RisuAI

RisuAI is useful as a power-user reference because it keeps lorebook, prompt-template, regex/script, assets and memory as separable subsystems. Its current repository advertises HypaMemoryV2/V3 and SupaMemory; the older SupaMemory design recursively summarizes history when context pressure grows. The latest 2026 repository structure still has dedicated `process/memory`, lorebook, embedding, provider and prompt-template modules, which supports keeping lore activation separate from conversational memory retrieval.

### AdamChat note

The exact Korean service referred to as “아담챗/AdamChat” could not be identified confidently from indexed public results on 2026-09-21; search results are dominated by unrelated products and usernames. It was therefore not used as an architectural source. Add its canonical URL before doing a feature-by-feature parity pass.
