import Link from "next/link";
import { cn } from "@/lib/utils";

export type Chip = { value: string; label: string };

/**
 * Filter chips as links: state lives in the URL, so filtered views are shareable
 * and the page stays a server component. `param` decides which query key it writes.
 */
export function FilterChips({
  chips,
  active,
  param = "sort",
  basePath = "/",
  extraQuery,
}: {
  chips: Chip[];
  active: string;
  param?: string;
  basePath?: string;
  extraQuery?: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const isActive = chip.value === active;
        const query: Record<string, string> = { ...extraQuery };
        if (chip.value) query[param] = chip.value;
        return (
          <Link
            key={chip.value || "all"}
            href={{ pathname: basePath, query }}
            scroll={false}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              isActive
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
            )}
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
