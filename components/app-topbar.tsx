import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CharacterSearch } from "@/components/character-search";

/** No hooks: the shell chrome is server-rendered, only the search palette is a client island. */
export function AppTopbar({ user }: { user: { name: string; email: string } | null }) {
  return (
    <header className="bg-background sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 px-4 sm:px-6">
      <SidebarTrigger className="-ml-1" aria-label="내비게이션 토글" />
      <div className="mx-auto flex w-full max-w-md items-center">
        <CharacterSearch />
      </div>
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
    <header className="bg-background sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 px-4 sm:px-6">
      <SidebarTrigger className="-ml-1" aria-label="내비게이션 토글" />
      <div className="mx-auto flex w-full max-w-md items-center">
        <div className="bg-muted/40 hidden h-8 w-full rounded-lg border sm:block" />
      </div>
    </header>
  );
}
