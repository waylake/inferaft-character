import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type {
  CharacterDetail,
  CharacterSummary,
  LoreEntrySummary,
  WorldBookEntry,
} from "@/lib/types";

export type {
  CharacterDetail,
  CharacterSummary,
  LoreEntrySummary,
  WorldBookEntry,
} from "@/lib/types";

const SUMMARY = `
  c.id, c.slug, c.name, c.creator, c.tagline, c.description, c.tags,
  c.image_url as "imageUrl", c.avatar_gradient as gradient,
  c.chat_count as "chatCount", c.like_count as "likeCount", c.featured,
  c.created_at as "createdAt", c.updated_at as "updatedAt",
  (select count(*)::int from lorebook_entry le
     join lorebook lb on lb.id = le.lorebook_id
    where lb.character_id = c.id) as "loreCount"`;

/** User-independent catalog. Cached with Cache Components; bust with revalidateTag("characters"). */
export async function getCatalog(): Promise<CharacterSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("characters");
  const { rows } = await db.query(
    `select ${SUMMARY} from character c where c.is_public = true order by c.chat_count desc, c.created_at desc`,
  );
  return rows as CharacterSummary[];
}

export async function getFeatured(): Promise<CharacterSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("characters");
  const { rows } = await db.query(
    `select ${SUMMARY} from character c where c.is_public = true and c.featured = true order by c.updated_at desc limit 3`,
  );
  return rows as CharacterSummary[];
}

export async function getCharacter(slug: string): Promise<CharacterDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("characters", `character-${slug}`);
  const { rows } = await db.query(
    `select ${SUMMARY}, c.personality, c.scenario, c.first_message as "firstMessage",
            c.system_prompt as "systemPrompt"
       from character c where c.slug = $1 and c.is_public = true limit 1`,
    [slug],
  );
  const character = rows[0] as CharacterDetail | undefined;
  if (!character) return null;

  const lore = await db.query(
    `select le.id, le.name, le.keys, le.content, le.constant
       from lorebook_entry le join lorebook lb on lb.id = le.lorebook_id
      where lb.character_id = $1
      order by le.constant desc, le.insertion_order asc`,
    [character.id],
  );
  return { ...character, lore: lore.rows as LoreEntrySummary[] };
}

/** Per-user numbers are dynamic, so they stay out of the cached readers. */
export async function getUserCharacterStats(userId: string, characterId: string) {
  const { rows } = await db.query(
    `select count(distinct c.id)::int as conversations,
            count(m.id)::int as messages,
            max(nullif(coalesce(c.narrative_summary, ''), '')) as narrative
       from conversation c
       left join message m on m.conversation_id = c.id
      where c.user_id = $1 and c.character_id = $2`,
    [userId, characterId],
  );
  return {
    conversations: Number(rows[0]?.conversations ?? 0),
    messages: Number(rows[0]?.messages ?? 0),
    narrative: (rows[0]?.narrative as string | null) ?? null,
  };
}

export async function getRecentConversations(userId: string, limit = 6) {
  const { rows } = await db.query(
    `select c.id, c.title, c.updated_at as "updatedAt",
            ch.slug, ch.name, ch.image_url as "imageUrl"
       from conversation c join character ch on ch.id = c.character_id
      where c.user_id = $1 order by c.updated_at desc limit $2`,
    [userId, limit],
  );
  return rows as { id: string; title: string | null; updatedAt: string; slug: string; name: string; imageUrl: string }[];
}

/** World info across the whole catalog — the 세계관 tab. */
export async function getWorldBook(limit = 40): Promise<WorldBookEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("characters");
  const { rows } = await db.query(
    `select le.id, le.name, le.keys, le.content, le.constant,
            ch.name as "characterName", ch.slug as "characterSlug", ch.creator as "characterCreator"
       from lorebook_entry le
       join lorebook lb on lb.id = le.lorebook_id
       join character ch on ch.id = lb.character_id
      where ch.is_public = true and le.enabled = true
      order by le.constant desc, le.insertion_order asc
      limit $1`,
    [limit],
  );
  return rows as WorldBookEntry[];
}

/** Characters with real conversation activity — what a feed means here. */
export async function getActivityFeed(limit = 12) {
  "use cache";
  cacheLife("minutes");
  cacheTag("feed");
  const { rows } = await db.query(
    `select ch.slug, ch.name, ch.creator, ch.tagline, ch.description, ch.tags,
            ch.image_url as "imageUrl", ch.avatar_gradient as gradient,
            ch.chat_count as "chatCount", ch.like_count as "likeCount", ch.featured,
            ch.created_at as "createdAt", ch.updated_at as "updatedAt",
            count(m.id)::int as "recentMessages",
            max(m.created_at) as "lastMessageAt",
            (select count(*)::int from lorebook_entry le
               join lorebook lb on lb.id = le.lorebook_id
              where lb.character_id = ch.id) as "loreCount"
       from character ch
       left join conversation c on c.character_id = ch.id
       left join message m on m.conversation_id = c.id and m.created_at > now() - interval '14 days'
      where ch.is_public = true
      group by ch.id
      having count(m.id) > 0 or ch.created_at > now() - interval '7 days'
      order by max(m.created_at) desc nulls last, ch.created_at desc
      limit $1`,
    [limit],
  );
  return rows as (CharacterSummary & { recentMessages: number; lastMessageAt: string | null })[];
}
