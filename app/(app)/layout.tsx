import { Suspense, cache } from "react";
import { SidebarInset, Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar, AppTopbarSkeleton } from "@/components/app-topbar";
import { getSession } from "@/lib/session";
import { getRecentConversations } from "@/lib/characters";

/** Deduped per request: the sidebar and the topbar both need the session. */
const shellData = cache(async () => {
  const session = await getSession();
  if (!session) return { user: null, conversations: [] };
  const conversations = await getRecentConversations(session.user.id);
  return {
    user: { name: session.user.name ?? "이름 없음", email: session.user.email },
    conversations,
  };
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-dvh overflow-hidden">
      <Suspense fallback={<Sidebar collapsible="icon" className="border-0" />}>
        <SidebarSlot />
      </Suspense>
      <SidebarInset className="min-w-0 overflow-hidden">
        <Suspense fallback={<AppTopbarSkeleton />}>
          <TopbarSlot />
        </Suspense>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

async function SidebarSlot() {
  const { user, conversations } = await shellData();
  return <AppSidebar user={user} conversations={conversations} />;
}

async function TopbarSlot() {
  const { user } = await shellData();
  return <AppTopbar user={user} />;
}
