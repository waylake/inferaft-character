import { ZepClient } from "@getzep/zep-cloud";
import { ensureZepUserAndThread, getZepContext, persistZepTurn } from "@getzep/zep-vercel-ai";

function client() {
  const key = process.env.ZEP_API_KEY;
  return key ? new ZepClient({ apiKey: key }) : null;
}

export async function ensureMemory(input: { userId: string; threadId: string; name: string; email: string; characterName: string }) {
  const zep = client();
  if (!zep) return;
  await ensureZepUserAndThread({
    client: zep,
    userId: input.userId,
    threadId: input.threadId,
    firstName: input.name || input.email.split("@")[0],
  }).catch(() => undefined);
}

export async function getLongTermMemory(threadId: string) {
  const zep = client();
  if (!zep) return "";
  return getZepContext(zep, threadId).catch(() => "");
}

export async function persistTurn(threadId: string, user: string, assistant: string) {
  const zep = client();
  if (!zep) return;
  await persistZepTurn(zep, threadId, { user, assistant }).catch(() => undefined);
}
