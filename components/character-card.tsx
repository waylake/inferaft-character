import Image from "next/image";
import { Heart, MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/format";
import type { CharacterSummary } from "@/lib/types";

export function CharacterCard({
  character,
  onOpen,
  priority = false,
  className,
}: {
  character: CharacterSummary;
  onOpen: (slug: string) => void;
  priority?: boolean;
  className?: string;
}) {
  return (
    <article className={cn("group relative overflow-hidden rounded-xl border bg-card", className)}>
      <div className="relative aspect-2/3 w-full overflow-hidden bg-muted">
        <Image
          src={character.imageUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 15rem"
          priority={priority}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="card-scrim absolute inset-x-0 bottom-0 h-2/5" />
        {character.featured && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            추천
          </Badge>
        )}
        <div className="absolute inset-x-0 bottom-0 space-y-1 p-3">
          <div className="flex items-center gap-3 text-xs text-white/70">
            <span className="flex items-center gap-1">
              <Heart className="size-3" /> {formatCount(character.likeCount)}
            </span>
            <span className="flex items-center gap-1">
              <MessagesSquare className="size-3" /> {formatCount(character.chatCount)}
            </span>
          </div>
          <h3 className="truncate font-heading text-sm font-semibold text-white">{character.name}</h3>
          <p className="truncate text-xs text-white/60">@{character.creator}</p>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{character.tagline}</p>
        <div className="flex flex-wrap gap-1">
          {character.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* single full-card click target: keeps headings out of a <button> and gives one focus stop */}
      <button
        type="button"
        onClick={() => onOpen(character.slug)}
        className="absolute inset-0 z-10 rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="sr-only">{character.name} 상세 보기</span>
      </button>
    </article>
  );
}
