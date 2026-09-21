import { Activity } from "lucide-react";
import { getActivityFeed } from "@/lib/characters";
import { CharacterCollection } from "@/components/character-collection";
import { SectionHeader } from "@/components/section-header";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { formatCount } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "피드" };

export default async function FeedPage() {
  const feed = await getActivityFeed();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeader
        title="피드"
        description="최근 2주 안에 실제 대화가 오간 캐릭터와 새로 공개된 캐릭터입니다."
      />

      {feed.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Activity />
            </EmptyMedia>
            <EmptyTitle>아직 활동이 없습니다</EmptyTitle>
            <EmptyDescription>
              캐릭터와 대화를 시작하면 이 목록에 최근 활동으로 나타납니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {feed.slice(0, 6).map((item) => (
              <Badge key={item.slug} variant="secondary" className="font-normal">
                {item.name}
                {item.recentMessages > 0 ? ` · 최근 메시지 ${formatCount(item.recentMessages)}` : " · 신규"}
              </Badge>
            ))}
          </div>
          <CharacterCollection characters={feed} priorityCount={4} />
        </>
      )}
    </main>
  );
}
