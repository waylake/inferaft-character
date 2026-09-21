"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { CharacterSearch } from "@/components/character-search";

export function AppTopbar({ user }: { user: { name: string; email: string } | null }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />

      <div className="flex flex-1 items-center justify-center">
        <CharacterSearch />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-8 sm:hidden"
        aria-label="검색"
        onClick={() => router.push("/characters")}
      >
        <Search />
      </Button>

      {user ? null : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">로그인</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">가입하기</Link>
          </Button>
        </div>
      )}
    </header>
  );
}

/** Fallback shown while the session resolves — keeps the bar height stable. */
export function AppTopbarSkeleton() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <div className="flex flex-1 items-center justify-center">
        <div className="hidden h-8 w-full max-w-md rounded-lg border bg-muted/40 sm:block" />
      </div>
      <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
    </header>
  );
}
