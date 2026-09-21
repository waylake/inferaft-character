create extension if not exists pgcrypto;

create table if not exists character (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null,
  description text not null,
  personality text not null,
  scenario text not null,
  first_message text not null,
  example_messages text not null default '',
  system_prompt text not null default '',
  post_history_instructions text not null default '',
  avatar_gradient text not null default 'from-violet-500 to-fuchsia-500',
  tags text[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lorebook (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references character(id) on delete cascade,
  name text not null,
  description text not null default '',
  scan_depth integer not null default 8 check (scan_depth between 1 and 100),
  token_budget integer not null default 1200 check (token_budget between 64 and 16000),
  recursive_scanning boolean not null default false,
  spec_version text not null default 'lorebook_v3',
  created_at timestamptz not null default now()
);

create table if not exists lorebook_entry (
  id uuid primary key default gen_random_uuid(),
  lorebook_id uuid not null references lorebook(id) on delete cascade,
  name text,
  keys text[] not null default '{}',
  secondary_keys text[] not null default '{}',
  content text not null,
  enabled boolean not null default true,
  constant boolean not null default false,
  selective boolean not null default false,
  case_sensitive boolean not null default false,
  use_regex boolean not null default false,
  insertion_order integer not null default 100,
  priority integer not null default 100,
  position text not null default 'after_char' check (position in ('before_char','after_char')),
  extensions jsonb not null default '{}'::jsonb
);
create index if not exists lorebook_entry_book_idx on lorebook_entry(lorebook_id);

create table if not exists persona (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  description text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists persona_user_idx on persona(user_id);

create table if not exists conversation (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  character_id uuid not null references character(id) on delete cascade,
  persona_id uuid references persona(id) on delete set null,
  title text,
  zep_thread_id text unique,
  current_scene_summary text not null default '',
  narrative_summary text not null default '',
  summary_through_message bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conversation_user_idx on conversation(user_id, updated_at desc);

create table if not exists message (
  id bigserial primary key,
  conversation_id uuid not null references conversation(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  variant_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists message_conversation_idx on message(conversation_id, id);

create table if not exists memory_note (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversation(id) on delete cascade,
  kind text not null check (kind in ('pinned','state','creator')),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists memory_note_conversation_idx on memory_note(conversation_id);
