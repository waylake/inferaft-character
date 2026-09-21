"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function Signup() {
  const router=useRouter(); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setError(""); const f=new FormData(e.currentTarget);
    const res=await authClient.signUp.email({name:String(f.get("name")),email:String(f.get("email")),password:String(f.get("password"))});
    setBusy(false); if(res.error){setError(res.error.message ?? "가입에 실패했습니다."); return;} router.push("/characters"); router.refresh(); }
  return <main className="mx-auto flex min-h-[75vh] max-w-md items-center px-5 py-16"><form onSubmit={submit} className="glass w-full rounded-3xl p-7"><h1 className="text-2xl font-semibold">계정 만들기</h1><p className="mt-2 text-sm text-zinc-400">가입 후 바로 캐릭터를 선택해 대화를 테스트할 수 있습니다.</p><div className="mt-7 space-y-4">{[["name","이름","도연"],["email","이메일","you@example.com"],["password","비밀번호","8자 이상"]].map(([n,l,p])=><label key={n} className="block text-sm"><span className="mb-2 block text-zinc-300">{l}</span><input required minLength={n==="password"?8:1} type={n==="password"?"password":"text"} name={n} placeholder={p} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"/></label>)}</div>{error&&<p className="mt-4 text-sm text-red-400">{error}</p>}<button disabled={busy} className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-medium text-black disabled:opacity-50">{busy?"생성 중…":"가입하고 캐릭터 보기"}</button><p className="mt-5 text-center text-xs text-zinc-500">이미 계정이 있으면 <Link href="/login" className="text-zinc-200">로그인</Link></p></form></main>;
}
