"use server";

import { getCatalog, getCharacter, type CharacterDetail } from "@/lib/characters";

export type CharacterIndexItem = { slug: string; name: string; creator: string; tags: string[] };

export async function loadCharacterIndex(): Promise<CharacterIndexItem[]> {
  const catalog = await getCatalog();
  return catalog.map(({ slug, name, creator, tags }) => ({ slug, name, creator, tags }));
}

export async function loadCharacterDetail(slug: string): Promise<CharacterDetail | null> {
  return getCharacter(slug);
}
