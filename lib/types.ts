export type Character = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  personality: string;
  scenario: string;
  first_message: string;
  example_messages: string;
  system_prompt: string;
  post_history_instructions: string;
  avatar_gradient: string;
  tags: string[];
};

export type LoreEntry = {
  id: string;
  name: string | null;
  keys: string[];
  secondary_keys: string[];
  content: string;
  enabled: boolean;
  constant: boolean;
  selective: boolean;
  case_sensitive: boolean;
  use_regex: boolean;
  insertion_order: number;
  priority: number;
  position: "before_char" | "after_char";
};

/** View models shared by server readers and client components (no runtime deps). */

export type CharacterSummary = {
  id: string;
  slug: string;
  name: string;
  creator: string;
  tagline: string;
  description: string;
  tags: string[];
  imageUrl: string;
  gradient: string;
  chatCount: number;
  likeCount: number;
  featured: boolean;
  loreCount: number;
  createdAt: string;
  updatedAt: string;
};

export type LoreEntrySummary = {
  id: string;
  name: string | null;
  keys: string[];
  content: string;
  constant: boolean;
};

export type CharacterDetail = CharacterSummary & {
  personality: string;
  scenario: string;
  firstMessage: string;
  systemPrompt: string;
  lore: LoreEntrySummary[];
};

export type WorldBookEntry = {
  id: string;
  name: string | null;
  keys: string[];
  content: string;
  constant: boolean;
  characterName: string;
  characterSlug: string;
  characterCreator: string;
};
