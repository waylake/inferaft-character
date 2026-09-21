import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Storydeck — character chat powered by Inferaft", description: "Character chat PoC with CCv3 lorebooks and persistent memory." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="font-semibold tracking-tight">Storydeck <span className="text-violet-400">/ Inferaft</span></Link>
        <nav className="flex items-center gap-5 text-sm text-zinc-300"><Link href="/characters">Characters</Link><Link href="/login">Login</Link></nav>
      </div>
    </header>{children}</body></html>;
}
