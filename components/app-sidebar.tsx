"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  Compass,
  Home,
  LogIn,
  LogOut,
  MessageSquareQuote,
  Newspaper,
} from "lucide-react";
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
  SidebarRail,
  useSidebar,
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
import { authClient } from "@/lib/auth-client";

const NAV = [
  { href: "/", label: "홈", icon: Home },
  { href: "/characters", label: "탐색", icon: Compass },
  { href: "/feed", label: "피드", icon: Newspaper },
] as const;

export type SidebarUser = { name: string; email: string } | null;
export type SidebarConversation = { id: string; name: string; slug: string; imageUrl: string };

/**
 * Composition follows the shadcn sidebar blocks: only the documented variants
 * (`size`, `isActive`, `tooltip`, `collapsible`) — no size/spacing overrides, so
 * the collapsed icon rail keeps the component's own geometry.
 */
export function AppSidebar({ user, conversations }: { user: SidebarUser; conversations: SidebarConversation[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon" className="border-0">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" aria-label="Storydeck 홈" onClick={() => setOpenMobile(false)}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <MessageSquareQuote className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="font-heading truncate text-sm font-semibold tracking-tight">Storydeck</span>
                  <span className="text-muted-foreground truncate text-xs">inferaft inference</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.label}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link href={item.href} aria-current={active ? "page" : undefined}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {user && conversations.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>내 대화</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {conversations.map((conversation) => {
                  const active = pathname === `/chat/${conversation.slug}`;
                  return (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton asChild isActive={active} tooltip={conversation.name}>
                        <Link
                          href={`/chat/${conversation.slug}`}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpenMobile(false)}
                        >
                          <Avatar className="size-5 rounded-md">
                            <AvatarFallback className="rounded-md text-xs">
                              {conversation.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{conversation.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
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
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="truncate text-sm font-medium">{user.name}</span>
                      <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel className="truncate font-normal">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void signOut()}>
                    <LogOut />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton asChild tooltip="로그인" size="lg">
                <Link href="/login" onClick={() => setOpenMobile(false)}>
                  <div className="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg">
                    <LogIn className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">로그인</span>
                    <span className="text-muted-foreground truncate text-xs">대화를 이어가려면</span>
                  </div>
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
