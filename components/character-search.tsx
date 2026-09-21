"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { loadCharacterIndex, type CharacterIndexItem } from "@/app/actions/characters";

export function CharacterSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CharacterIndexItem[] | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // One fetch of the whole index, then filter locally — the catalog is 15 rows.
  // Past a few hundred characters this should take the query as an argument.
  useEffect(() => {
    if (!open || items) return;
    void loadCharacterIndex().then(setItems);
  }, [open, items]);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-8 w-full max-w-md justify-start gap-2 px-3 font-normal text-muted-foreground sm:inline-flex"
      >
        <Search className="size-4" />
        캐릭터, 태그, 세계관 검색
        <Kbd className="ml-auto">⌘K</Kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="검색"
        className="size-8 sm:hidden"
        onClick={() => setOpen(true)}
      >
        <Search />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="캐릭터 검색" description="이름, 태그, 창작자로 찾기">
        <CommandInput placeholder="캐릭터, 태그, 창작자 검색…" />
        <CommandList>
          <CommandEmpty>{items ? "결과가 없습니다." : "불러오는 중…"}</CommandEmpty>
          <CommandGroup heading="캐릭터">
            {(items ?? []).map((item) => (
              <CommandItem
                key={item.slug}
                value={`${item.name} ${item.creator} ${item.tags.join(" ")}`}
                onSelect={() => {
                  setOpen(false);
                  router.push(`/characters?q=${encodeURIComponent(item.name)}`);
                }}
              >
                <span className="truncate font-medium">{item.name}</span>
                <span className="truncate text-xs text-muted-foreground">@{item.creator}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
