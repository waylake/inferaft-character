"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BookMarked, Heart, MessagesSquare, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { formatCount, formatDate } from "@/lib/format";
import type { CharacterDetail, CharacterSummary } from "@/lib/types";
import { loadCharacterDetail } from "@/app/actions/characters";
import { startConversation } from "@/app/actions/conversations";

export function CharacterDetailDialog({
  character,
  onOpenChange,
}: {
  character: CharacterSummary | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [loaded, setLoaded] = useState<{ slug: string; detail: CharacterDetail | null } | null>(null);
  const slug = character?.slug ?? null;

  // Detail (scenario + world book) is loaded only for the card that was opened.
  // The loading flag is derived from `loaded`, so the effect never sets state synchronously.
  useEffect(() => {
    if (!slug) return;
    let alive = true;
    void loadCharacterDetail(slug).then((detail) => {
      if (alive) setLoaded({ slug, detail });
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  const detail = loaded?.slug === slug ? loaded.detail : null;

  if (!character) {
    return <Dialog open={false} onOpenChange={onOpenChange} />;
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-4xl">
        <div className="flex min-w-0 flex-col sm:flex-row">
          <div className="bg-sidebar flex shrink-0 flex-col gap-4 p-4 sm:w-64">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted sm:aspect-2/3">
              <Image
                src={character.imageUrl}
                alt={character.name}
                fill
                sizes="(max-width: 640px) 100vw, 16rem"
                className="object-cover"
              />
            </div>
            <form action={startConversation} className="mt-auto">
              <input type="hidden" name="slug" value={character.slug} />
              <Button type="submit" className="w-full">
                새 대화 시작
              </Button>
            </form>
            <p className="text-muted-foreground text-xs leading-4">
              공개 {formatDate(character.createdAt)}
              <br />
              수정 {formatDate(character.updatedAt)}
            </p>
          </div>

          <div className="min-w-0 space-y-5 p-5 sm:p-6">
            <DialogHeader className="gap-2 text-left">
              <DialogTitle className="text-heading font-medium tracking-tight">{character.name}</DialogTitle>
              <DialogDescription className="text-pretty">
                {character.tagline}
              </DialogDescription>
              <p className="text-xs text-muted-foreground">@{character.creator}</p>
            </DialogHeader>

            <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <Heart className="size-3.5" /> {formatCount(character.likeCount)}
              </span>
              <span className="flex items-center gap-1.5">
                <MessagesSquare className="size-3.5" /> {formatCount(character.chatCount)}
              </span>
              <span className="flex items-center gap-1.5">
                <BookMarked className="size-3.5" /> 세계관 {character.loreCount}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {character.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>

            <p className="text-sm leading-6 text-muted-foreground">{character.description}</p>
            <Separator />

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 font-heading text-sm font-medium">
                <Sparkles className="text-primary size-4" /> 첫 장면
              </h3>
              {detail ? (
                <p className="text-sm leading-6 text-muted-foreground">{detail.scenario}</p>
              ) : (
                <Skeleton className="h-10 w-full" />
              )}
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 font-heading text-sm font-medium">
                <BookMarked className="text-primary size-4" /> 세계관 정보
              </h3>
              {detail ? (
                <ItemGroup className="gap-2">
                  {detail.lore.slice(0, 4).map((entry) => (
                    <Item key={entry.id} variant="outline" className="items-start">
                      <ItemContent className="gap-1">
                        <ItemTitle className="text-xs">
                          {entry.name ?? "로어"}
                          {entry.constant && (
                            <Badge variant="outline" className="ml-1.5 text-xs font-normal">
                              항상 적용
                            </Badge>
                          )}
                        </ItemTitle>
                        <ItemDescription className="line-clamp-2 text-xs leading-5">
                          {entry.content}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  ))}
                </ItemGroup>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}
            </section>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
