import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { BookMarked, Flame, Sparkles } from "lucide-react";
import { getCatalog, getFeatured, getWorldBook } from "@/lib/characters";
import { HeroCarousel } from "@/components/hero-carousel";
import { CharacterCollection } from "@/components/character-collection";
import { FilterChips } from "@/components/filter-chips";
import { SectionHeader } from "@/components/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SORTS = [
  { value: "", label: "추천" },
  { value: "popular", label: "인기" },
  { value: "new", label: "신작" },
  { value: "name", label: "이름순" },
];

// Rendered per request. The data still comes from the runtime `use cache` layer, but
// prerendering it would make the production image need a reachable database at build time.
export const instant = false;

/**
 * Static shell (cached catalog) + one streamed region for the chip-driven grid.
 * `searchParams` is runtime data, so only the part that reads it sits in Suspense.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  await connection();
  const [catalog, featured, world] = await Promise.all([getCatalog(), getFeatured(), getWorldBook()]);

  const recommended = [...catalog]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.chatCount - a.chatCount)
    .slice(0, 8);
  const trending = [...catalog].sort((a, b) => b.chatCount - a.chatCount).slice(0, 8);
  const fresh = [...catalog].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8);
  const topTag = mostCommonTag(catalog.map((c) => c.tags));
  const tagShelf = topTag ? catalog.filter((c) => c.tags.includes(topTag)).slice(0, 8) : [];

  return (
    <main className="px-gutter py-section mx-auto w-full max-w-7xl space-y-10">
      <HeroCarousel characters={featured} />

      <Tabs defaultValue="characters" className="gap-6">
        <TabsList variant="line">
          <TabsTrigger value="characters">캐릭터</TabsTrigger>
          <TabsTrigger value="world">세계관</TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="space-y-10">
          <section>
            <SectionHeader
              title="추천하는 캐릭터"
              description={`${recommended.length}명 · 설정과 대화 스타일이 뚜렷한 캐릭터`}
              href="/characters"
            />
            <CharacterCollection characters={recommended} layout="row" priorityCount={4} />
          </section>

          <section>
            <SectionHeader
              title="지금 대화가 많은 캐릭터"
              description="누적 대화 수 기준"
              href={{ pathname: "/characters", query: { sort: "popular" } }}
            />
            <CharacterCollection characters={trending} layout="row" />
          </section>

          <section>
            <SectionHeader
              title="새로 들어온 캐릭터"
              description="최근 공개 순"
              href={{ pathname: "/characters", query: { sort: "new" } }}
            />
            <CharacterCollection characters={fresh} layout="row" />
          </section>

          {tagShelf.length > 2 && (
            <section>
              <SectionHeader
                title={`#${topTag} 캐릭터`}
                description="태그로 이어지는 다른 캐릭터"
                href={{ pathname: "/characters", query: { tag: topTag } }}
              />
              <CharacterCollection characters={tagShelf} layout="row" />
            </section>
          )}

          <Suspense fallback={<CatalogFallback />}>
            <FullCatalog searchParams={searchParams} />
          </Suspense>
        </TabsContent>

        <TabsContent value="world" className="space-y-4">
          <SectionHeader
            title="세계관 정보"
            description="각 캐릭터의 로어북에 등록된 규칙과 배경. 대화 중 키워드가 나오면 그때 프롬프트에 들어갑니다."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {world.map((entry) => (
              <Card key={entry.id} className="gap-3">
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookMarked className="size-3.5" />
                    <span className="truncate">
                      {entry.characterName} · @{entry.characterCreator}
                    </span>
                  </div>
                  <CardTitle className="text-sm">{entry.name ?? "로어"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{entry.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {entry.constant ? (
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        <Sparkles className="size-3" /> 항상 적용
                      </Badge>
                    ) : (
                      entry.keys.slice(0, 4).map((key) => (
                        <Badge key={key} variant="outline" className="text-[10px] font-normal">
                          {key}
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={{ pathname: "/characters", query: { q: entry.characterName } }}>
                      <Flame /> {entry.characterName} 찾기
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

async function FullCatalog({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort = "" } = await searchParams;
  const catalog = await getCatalog();
  const sorted = [...catalog];

  switch (sort) {
    case "popular":
      sorted.sort((a, b) => b.chatCount - a.chatCount);
      break;
    case "new":
      sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
      break;
    default:
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.chatCount - a.chatCount);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader title="전체 캐릭터" description={`${sorted.length}명`} />
      </div>
      <FilterChips chips={SORTS} active={sort} basePath="/" />
      <CharacterCollection characters={sorted} />
    </section>
  );
}

function CatalogFallback() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="flex gap-2">
        {SORTS.map((sort) => (
          <Skeleton key={sort.value} className="h-7 w-16 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-2/3 w-full rounded-xl" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}

function mostCommonTag(tagLists: string[][]) {
  const counts = new Map<string, number>();
  for (const tags of tagLists) for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
