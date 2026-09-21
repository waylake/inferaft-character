import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookMarked, Brain, MessagesSquare, Sparkles } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getCharacter, getUserCharacterStats } from "@/lib/characters";
import { db } from "@/lib/db";
import { ChatPanel, type ChatMessage } from "@/components/chat/chat-panel";
import { startConversation } from "@/app/actions/conversations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function ChatRoute({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatScreen params={params} />
    </Suspense>
  );
}

async function ChatScreen({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireSession();
  const { slug } = await params;

  const character = await getCharacter(slug);
  if (!character) notFound();

  const found = await db.query(
    `select id, current_scene_summary, narrative_summary
       from conversation where user_id = $1 and character_id = $2
      order by updated_at desc limit 1`,
    [session.user.id, character.id],
  );
  const conversation = found.rows[0] as
    | { id: string; current_scene_summary: string; narrative_summary: string }
    | undefined;

  const stats = await getUserCharacterStats(session.user.id, character.id);

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r p-4 lg:flex">
        <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl border bg-muted">
          <Image src={character.imageUrl} alt={character.name} fill sizes="18rem" className="object-cover" />
        </div>
        <div className="space-y-1">
          <h1 className="font-heading text-lg font-semibold">{character.name}</h1>
          <p className="text-xs text-muted-foreground">@{character.creator}</p>
          <p className="pt-1 text-sm leading-6 text-muted-foreground">{character.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {character.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-normal text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>

        <Separator />

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookMarked className="size-3.5 text-primary" /> 세계관 {character.loreCount}개 적용 가능
          </div>
          <div className="flex items-center gap-2">
            <Brain className="size-3.5 text-primary" /> 요약 메모리{" "}
            {conversation?.narrative_summary ? "사용 중" : "첫 요약 전"}
          </div>
          <div className="flex items-center gap-2">
            <MessagesSquare className="size-3.5 text-primary" /> 내 대화 {stats.conversations}개 · 메시지{" "}
            {stats.messages}개
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary" /> Inferaft{" "}
            {process.env.INFERAFT_CHAT_MODEL ?? "qwen-3.8-27b"}
          </div>
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b px-4 py-3 lg:hidden">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border bg-muted">
            <Image src={character.imageUrl} alt="" fill sizes="2.25rem" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{character.name}</p>
            <p className="truncate text-xs text-muted-foreground">{character.tagline}</p>
          </div>
        </header>

        {conversation ? (
          <ChatPanel
            character={{ name: character.name, imageUrl: character.imageUrl }}
            conversationId={conversation.id}
            initialMessages={await initialMessages(conversation.id)}
          />
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center p-6">
            <Empty className="max-w-md">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessagesSquare />
                </EmptyMedia>
                <EmptyTitle>{character.name}와의 대화가 아직 없습니다</EmptyTitle>
                <EmptyDescription>
                  대화를 시작하면 첫 장면이 열리고, 이후 턴은 요약 메모리와 로어북을 함께 참고합니다.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <form action={startConversation}>
                  <input type="hidden" name="slug" value={character.slug} />
                  <Button type="submit">새 대화 시작</Button>
                </form>
              </EmptyContent>
            </Empty>
          </div>
        )}
      </section>
    </div>
  );
}

async function initialMessages(conversationId: string): Promise<ChatMessage[]> {
  const { rows } = await db.query(
    `select id, role, content from message where conversation_id = $1 order by id asc limit 200`,
    [conversationId],
  );
  return rows.map((row) => ({ id: String(row.id), role: row.role, content: row.content }));
}

function ChatSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <aside className="hidden w-72 shrink-0 flex-col gap-4 border-r p-4 lg:flex">
        <Skeleton className="aspect-2/3 w-full rounded-xl" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-20 w-full" />
      </aside>
      <section className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="ml-auto h-12 w-1/2" />
        <Skeleton className="h-24 w-3/4" />
      </section>
    </div>
  );
}
