"use client";

import { useState } from "react";
import { CharacterCard } from "@/components/character-card";
import { CharacterDetailDialog } from "@/components/character-detail-dialog";
import { cn } from "@/lib/utils";
import type { CharacterSummary } from "@/lib/types";

export function CharacterCollection({
  characters,
  layout = "grid",
  priorityCount = 0,
  className,
}: {
  characters: CharacterSummary[];
  layout?: "grid" | "row";
  priorityCount?: number;
  className?: string;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const selected = characters.find((c) => c.slug === slug) ?? null;

  return (
    <>
      <div
        className={cn(
          layout === "row"
            ? "flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          className,
        )}
      >
        {characters.map((character, index) => (
          <CharacterCard
            key={character.slug}
            character={character}
            onOpen={setSlug}
            priority={index < priorityCount}
            className={layout === "row" ? "w-40 shrink-0 sm:w-44" : undefined}
          />
        ))}
      </div>
      <CharacterDetailDialog character={selected} onOpenChange={(open) => !open && setSlug(null)} />
    </>
  );
}
