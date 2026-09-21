import { generateText, Output } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { inferaftModel } from "@/lib/inferaft";

const Summary = z.object({
  currentScene: z.string().max(3000),
  narrative: z.string().max(8000),
});

export async function maybeUpdateSummaries(conversationId: string) {
  if (process.env.INFERAFT_MOCK === "true" || !process.env.INFERAFT_API_KEY) return;
  const every = Math.max(4, Number(process.env.SUMMARY_EVERY_TURNS || 8));
  const state = await db.query(
    `select current_scene_summary,narrative_summary,summary_through_message from conversation where id=$1`,
    [conversationId],
  );
  if (!state.rows[0]) return;
  const last = Number(state.rows[0].summary_through_message || 0);
  const count = await db.query(
    `select count(*)::int n, coalesce(max(id),0)::bigint max_id from message where conversation_id=$1 and id>$2 and role in ('user','assistant')`,
    [conversationId, last],
  );
  if (Number(count.rows[0].n) < every * 2) return;
  const batch = await db.query(
    `select id,role,content from message where conversation_id=$1 and id>$2 order by id asc limit $3`,
    [conversationId, last, every * 2 + 4],
  );
  if (!batch.rows.length) return;

  const transcript = batch.rows.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
  const { output } = await generateText({
    model: inferaftModel(),
    output: Output.object({ schema: Summary }),
    prompt: `You maintain memory for a fictional character roleplay. Update two summaries from the new transcript.\n\nCURRENT SCENE SUMMARY:\n${state.rows[0].current_scene_summary || "(none)"}\n\nLONG-RANGE NARRATIVE SUMMARY:\n${state.rows[0].narrative_summary || "(none)"}\n\nNEW TRANSCRIPT:\n${transcript}\n\nRules:\n- currentScene: only facts needed for the immediate scene: location, present participants, active physical/emotional state, open actions and short-term goals. Replace stale scene facts.\n- narrative: durable chronological events, promises, discoveries, relationship changes and unresolved long-term threads. Merge with the previous narrative instead of restarting.\n- Never invent events not present in the transcript or previous summaries.\n- Do not turn guesses about the user into facts.\n- Keep names and concrete details when they matter.`,
  });
  const through = batch.rows.at(-1)?.id;
  if (!through) return;
  await db.query(
    `update conversation set current_scene_summary=$2,narrative_summary=$3,summary_through_message=$4,updated_at=now() where id=$1`,
    [conversationId, output.currentScene, output.narrative, through],
  );
}
