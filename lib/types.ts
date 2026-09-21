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
