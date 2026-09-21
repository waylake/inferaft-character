-- Card/showcase fields for the discovery UI. All mock-seeded in scripts/seed.mjs.
alter table character add column if not exists image_url text not null default '';
alter table character add column if not exists creator text not null default '';
alter table character add column if not exists chat_count integer not null default 0;
alter table character add column if not exists like_count integer not null default 0;
alter table character add column if not exists featured boolean not null default false;
create index if not exists character_featured_idx on character(featured) where featured;
