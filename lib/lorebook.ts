import type { LoreEntry } from "@/lib/types";

function testKey(text: string, key: string, entry: LoreEntry) {
  if (!key) return false;
  if (entry.use_regex) {
    try { return new RegExp(key, entry.case_sensitive ? "u" : "iu").test(text); } catch { return false; }
  }
  const haystack = entry.case_sensitive ? text : text.toLocaleLowerCase();
  const needle = entry.case_sensitive ? key : key.toLocaleLowerCase();
  return haystack.includes(needle);
}

export function activateLore(entries: LoreEntry[], scanText: string, tokenBudget = 1200) {
  const candidates = entries.filter((entry) => {
    if (!entry.enabled) return false;
    if (entry.constant) return true;
    const primary = entry.keys.some((key) => testKey(scanText, key, entry));
    if (!primary) return false;
    if (!entry.selective) return true;
    return entry.secondary_keys.some((key) => testKey(scanText, key, entry));
  });

  candidates.sort((a, b) => b.priority - a.priority || b.insertion_order - a.insertion_order);
  const chosen: LoreEntry[] = [];
  let estimated = 0;
  for (const entry of candidates) {
    const cost = Math.ceil(entry.content.length / 4);
    if (estimated + cost > tokenBudget && !entry.constant) continue;
    chosen.push(entry);
    estimated += cost;
  }
  return chosen.sort((a, b) => a.insertion_order - b.insertion_order);
}
