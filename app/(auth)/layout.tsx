import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm space-y-8">
        <Link href="/" className="flex items-center justify-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <MessageSquareQuote className="size-4" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">Storydeck</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
