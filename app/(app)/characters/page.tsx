import { SearchX } from "lucide-react";
import { getCatalog } from "@/lib/characters";
import { CharacterCollection } from "@/components/character-collection";
import { FilterChips } from "@/components/filter-chips";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SORTS = [
  { value: "", label: "추천" },
  { value: "popular", label: "인기" },
  { value: "new", label: "신작" },
  { value: "name", label: "이름순" },
];

export const metadata = { title: "탐색" };

// Search lives in the URL, so this route is intentionally rendered per request
// instead of being prerendered behind a skeleton.
export const instant = false;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; tag?: string }>;
}) {
  const { q = "", sort = "", tag = "" } = await searchParams;
  const catalog = await getCatalog();

  const needle = q.trim().toLowerCase();
  let results = catalog.filter((character) => {
    if (tag && !character.tags.includes(tag)) return false;
    if (!needle) return true;
    return [character.name, character.creator, character.tagline, character.description, ...character.tags]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  switch (sort) {
    case "popular":
      results = [...results].sort((a, b) => b.chatCount - a.chatCount);
      break;
    case "new":
      results = [...results].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
    case "name":
      results = [...results].sort((a, b) => a.name.localeCompare(b.name, "ko"));
      break;
    default:
      results = [...results].sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.chatCount - a.chatCount,
      );
  }

  const allTags = [...new Set(catalog.flatMap((c) => c.tags))].slice(0, 10);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">탐색</h1>
        <p className="text-sm text-muted-foreground">
          {catalog.length}명의 캐릭터 · 태그와 대화 스타일로 찾아보세요.
        </p>
      </div>

      <form action="/characters" className="flex max-w-xl gap-2">
        <Input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="이름, 창작자, 태그, 한 줄 소개로 검색"
          aria-label="캐릭터 검색"
        />
        {sort && <input type="hidden" name="sort" value={sort} />}
        {tag && <input type="hidden" name="tag" value={tag} />}
        <Button type="submit">검색</Button>
      </form>

      <div className="space-y-3">
        <FilterChips chips={SORTS} active={sort} basePath="/characters" extraQuery={{ q, tag }} />
        <FilterChips
          chips={[{ value: "", label: "태그 전체" }, ...allTags.map((t) => ({ value: t, label: `#${t}` }))]}
          active={tag}
          param="tag"
          basePath="/characters"
          extraQuery={{ q, sort }}
        />
      </div>

      {results.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>조건에 맞는 캐릭터가 없습니다</EmptyTitle>
            <EmptyDescription>검색어를 줄이거나 태그 필터를 해제해 보세요.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <CharacterCollection characters={results} priorityCount={4} />
      )}
    </main>
  );
}
