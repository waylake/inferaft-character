"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
  useCarousel,
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
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (characters.length === 0) return null;

  return (
    <section aria-label="추천 캐릭터">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="-ml-0">
          {characters.map((character, index) => (
            <CarouselItem key={character.slug} className="pl-0">
              <article className="bg-card relative flex min-h-56 overflow-hidden rounded-2xl border sm:min-h-72">
                <div className="relative z-10 flex max-w-xl flex-col justify-center gap-3 p-6 sm:p-9">
                  <Badge variant="secondary" className="w-fit">
                    지금 뜨는 캐릭터
                  </Badge>
                  <h2 className="text-title font-medium tracking-tight text-balance">{character.name}</h2>
                  <p className="text-muted-foreground max-w-md text-sm leading-6 sm:text-base">
                    {character.tagline}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
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
                  <div className="from-card via-card/80 absolute inset-0 bg-linear-to-r to-transparent" />
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* in flow, not absolutely positioned — nothing to overlap or clip */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {characters.map((character, index) => (
              <button
                key={character.slug}
                type="button"
                aria-label={`${index + 1}번째 추천 캐릭터로 이동`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => api?.scrollTo(index)}
                className={
                  index === current
                    ? "bg-primary h-1.5 w-6 rounded-full transition-all"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/60 h-1.5 w-1.5 rounded-full transition-all"
                }
              />
            ))}
          </div>
          <span className="text-muted-foreground font-mono text-xs">
            {current + 1} / {characters.length}
          </span>
          <CarouselControls />
        </div>
      </Carousel>
    </section>
  );
}

/** Lives inside the Carousel so useCarousel() provides the navigation API. */
function CarouselControls() {
  const { scrollPrev, scrollNext } = useCarousel();
  return (
    <div className="ml-auto flex items-center gap-2">
      <Button variant="outline" size="icon-sm" onClick={scrollPrev} aria-label="이전 캐릭터">
        <ChevronLeft />
      </Button>
      <Button variant="outline" size="icon-sm" onClick={scrollNext} aria-label="다음 캐릭터">
        <ChevronRight />
      </Button>
    </div>
  );
}
