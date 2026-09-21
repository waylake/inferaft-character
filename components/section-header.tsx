import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  title,
  description,
  href,
  linkLabel = "더 보기",
}: {
  title: string;
  description?: string;
  href?: React.ComponentProps<typeof Link>["href"];
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-heading font-medium tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground mt-1.5 text-sm text-pretty">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex shrink-0 items-center gap-1 rounded-md px-1 py-1 text-xs transition-colors focus-visible:ring-3 focus-visible:outline-none"
        >
          {linkLabel} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
