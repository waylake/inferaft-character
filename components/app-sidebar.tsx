"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, LogIn, MessageSquareQuote, Newspaper, UserRound } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV = [
  { href: "/", label: "홈", icon: Home },
  { href: "/characters", label: "탐색", icon: Compass },
  { href: "/feed", label: "피드", icon: Newspaper },
] as const;

export type SidebarUser = { name: string; email: string } | null;
export type SidebarConversation = { id: string; name: string; slug: string; imageUrl: string };

export function AppSidebar({ user, conversations }: { user: SidebarUser; conversations: SidebarConversation[] }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <MessageSquareQuote className="size-4" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-sm font-semibold">Storydeck</span>
                  <span className="truncate text-xs text-muted-foreground">inferaft inference</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>내 대화</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {conversations.length === 0 && (
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                )}
                {conversations.map((c) => (
                  <SidebarMenuItem key={c.id}>
                    <SidebarMenuButton asChild tooltip={c.name} isActive={pathname === `/chat/${c.slug}`}>
                      <Link href={`/chat/${c.slug}`}>
                        <Avatar className="size-5 rounded-md">
                          <AvatarFallback className="rounded-md bg-muted text-[10px]">
                            {c.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{c.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" tooltip={user.name}>
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">{user.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <span className="grid flex-1 text-left leading-tight">
                      <span className="truncate text-sm font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <span className="flex items-center gap-2 text-sm">
                      <UserRound className="size-4" /> {user.name}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/login">다른 계정으로 로그인</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton asChild tooltip="로그인" size="lg">
                <Link href="/login">
                  <LogIn />
                  <span>로그인</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
