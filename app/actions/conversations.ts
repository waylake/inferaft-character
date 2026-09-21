"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Creates (or reuses) the user's conversation for a character, then opens it.
 * Mutations live here rather than in a page render, so a GET never writes.
 */
export async function startConversation(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) redirect("/characters");

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/login?next=${encodeURIComponent(`/chat/${slug}`)}`);

  const found = await db.query(
    "select id, name, first_message from character where slug = $1 and is_public = true limit 1",
    [slug],
  );
  const character = found.rows[0] as { id: string; name: string; first_message: string } | undefined;
  if (!character) redirect("/characters");

  const existing = await db.query(
    "select id from conversation where user_id = $1 and character_id = $2 order by updated_at desc limit 1",
    [session.user.id, character.id],
  );
  if (!existing.rows[0]) {
    const created = await db.query(
      `insert into conversation(user_id, character_id, zep_thread_id, title)
       values($1,$2,$3,$4) returning id`,
      [session.user.id, character.id, crypto.randomUUID(), `${character.name}와의 대화`],
    );
    await db.query("insert into message(conversation_id, role, content) values($1,'assistant',$2)", [
      created.rows[0].id,
      character.first_message,
    ]);
  }

  redirect(`/chat/${slug}`);
}
