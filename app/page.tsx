import Link from "next/link";
import { ArrowRight, BookOpen, Brain, ImageIcon, Sparkles } from "lucide-react";

const features = [
  [BookOpen, "Lorebook native", "CCv3-style world info is selected by keyword, priority and token budget instead of stuffing the whole world into every prompt."],
  [Brain, "Layered memory", "Recent turns, current-scene summary, long-range narrative summary and Zep temporal memory each do one job."],
  [ImageIcon, "Built for multimodal", "The service sits on Inferaft, so text now and character-consistent scene images can share the same account and infrastructure."],
];

export default function Home() {
  return <main>
    <section className="mx-auto grid min-h-[72vh] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.1fr_.9fr]">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-200"><Sparkles size={14}/> Character chat, without the toy memory model</div>
        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-7xl">Characters that remember the <span className="text-violet-400">story</span>, not just the last message.</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">A focused character-chat PoC powered by Inferaft. Standard lorebook semantics, persona-aware prompting, layered narrative memory and a clean path to image scenes.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black">Create account <ArrowRight size={16}/></Link><Link href="/characters" className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-200">Browse characters</Link></div>
      </div>
      <div className="glass rounded-[2rem] p-4 shadow-2xl shadow-violet-950/30">
        <div className="rounded-[1.5rem] border border-white/5 bg-zinc-950 p-5">
          <div className="mb-6 flex items-center justify-between"><div><div className="font-medium">Aria Vale</div><div className="text-xs text-zinc-500">Vesper Archive · memory-aware</div></div><div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700"/></div>
          <div className="space-y-4 text-sm leading-6"><div className="max-w-[84%] rounded-2xl rounded-tl-sm bg-zinc-900 p-4 text-zinc-200">문을 닫아 주세요. 여긴 이름보다 기억이 더 쉽게 도난당하니까요.</div><div className="ml-auto max-w-[84%] rounded-2xl rounded-tr-sm bg-violet-600 p-4">지난번에 말한 그 봉인 기록, 아직 있어?</div><div className="max-w-[84%] rounded-2xl rounded-tl-sm bg-zinc-900 p-4 text-zinc-200">있어요. 그리고 지난번엔 당신이 직접 열지 않겠다고 했죠. 마음이 바뀐 이유부터 듣고 싶네요.</div></div>
          <div className="mt-5 flex gap-2 border-t border-white/5 pt-4 text-[11px] text-zinc-500"><span className="rounded-full bg-zinc-900 px-2.5 py-1">Lore: Archive rule</span><span className="rounded-full bg-zinc-900 px-2.5 py-1">Memory: promise recalled</span></div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 pb-24"><div className="grid gap-4 md:grid-cols-3">{features.map(([Icon,title,copy]) => { const I=Icon as typeof BookOpen; return <div key={String(title)} className="glass rounded-2xl p-6"><I className="mb-5 text-violet-400"/><h2 className="font-medium">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{String(copy)}</p></div>; })}</div></section>
  </main>;
}
