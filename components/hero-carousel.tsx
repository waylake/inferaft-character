"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import type { CharacterSummary } from "@/lib/types";
import { startConversation } from "@/app/actions/conversations";

export function HeroCarousel({ characters }: { characters: CharacterSummary[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (characters.length === 0) return null;

  return (
    <section aria-label="추천 캐릭터" className="relative">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="-ml-0">
          {characters.map((character, index) => (
            <CarouselItem key={character.slug} className="pl-0">
              <article className="relative flex min-h-56 overflow-hidden rounded-2xl border bg-card sm:min-h-72">
                <div className="relative z-10 flex max-w-xl flex-col justify-center gap-3 p-6 sm:p-9">
                  <Badge variant="secondary" className="w-fit">
                    지금 뜨는 캐릭터
                  </Badge>
                  <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
                    {character.name}
                  </h2>
                  <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                    {character.tagline}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    대화 {formatCount(character.chatCount)} · 세계관 {character.loreCount}개
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <form action={startConversation}>
                      <input type="hidden" name="slug" value={character.slug} />
                      <Button type="submit">
                        <Play /> 대화 시작
                      </Button>
                    </form>
                    <Button variant="outline" asChild>
                      <Link href="/characters">
                        더 찾아보기 <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="absolute inset-y-0 right-0 w-1/2 sm:w-3/5">
                  <Image
                    src={character.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 40rem"
                    priority={index === 0}
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-card via-card/80 to-transparent" />
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* arrows sit bottom-right over the artwork so they never cover the copy */}
        <CarouselPrevious className="inset-y-auto top-auto right-14 bottom-3 left-auto my-0" />
        <CarouselNext className="inset-y-auto top-auto right-3 bottom-3 left-auto my-0" />
      </Carousel>

      <div className="mt-3 flex items-center gap-1.5" role="tablist" aria-label="추천 캐릭터 페이지">
        {characters.map((character, index) => (
          <button
            key={character.slug}
            type="button"
            role="tab"
            aria-selected={index === current}
            aria-label={`${index + 1} / ${characters.length}`}
            onClick={() => api?.scrollTo(index)}
            className={
              index === current
                ? "h-1.5 w-6 rounded-full bg-primary transition-all"
                : "h-1.5 w-1.5 rounded-full bg-muted-foreground/30 transition-all hover:bg-muted-foreground/60"
            }
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">
          {current + 1} / {characters.length}
        </span>
      </div>
    </section>
  );
}
