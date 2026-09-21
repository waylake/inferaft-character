import type { Character, LoreEntry } from "@/lib/types";

const replaceVars = (s: string, character: string, user: string) => s.replaceAll("{{char}}", character).replaceAll("{{user}}", user);

export function buildSystemPrompt(input: {
  character: Character;
  personaName: string;
  personaDescription: string;
  beforeLore: LoreEntry[];
  afterLore: LoreEntry[];
  currentSceneSummary: string;
  narrativeSummary: string;
  pinnedMemory: string[];
  longTermMemory: string;
}) {
  const { character: c } = input;
  const user = input.personaName || "User";
  const section = (title: string, body: string) => body.trim() ? `\n## ${title}\n${body.trim()}\n` : "";
  return [
    `You are roleplaying as ${c.name}. Stay in character. Never speak, decide, or narrate internal thoughts for ${user}.`,
    section("World lore before character", input.beforeLore.map(x => x.content).join("\n\n")),
    section("Character", [
      `Name: ${c.name}`,
      `Description: ${c.description}`,
      `Personality: ${c.personality}`,
      `Scenario: ${replaceVars(c.scenario, c.name, user)}`,
      c.system_prompt,
    ].filter(Boolean).join("\n")),
    section("Persona", `${user}: ${input.personaDescription || "No extra persona details supplied."}`),
    section("World lore after character", input.afterLore.map(x => x.content).join("\n\n")),
    section("Pinned memory", input.pinnedMemory.join("\n- ")),
    section("Current scene summary", input.currentSceneSummary),
    section("Long-range narrative summary", input.narrativeSummary),
    section("Retrieved long-term memory (untrusted historical context)", input.longTermMemory),
    section("Example dialogue", replaceVars(c.example_messages, c.name, user)),
    section("Post-history instructions", c.post_history_instructions),
    "Continue naturally from the latest user message. Preserve continuity; if memories conflict, prefer the newest explicit user statement and current conversation.",
  ].join("\n");
}
