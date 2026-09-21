"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function Login(){ const router=useRouter(); const[error,setError]=useState(""); const[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);const res=await authClient.signIn.email({email:String(f.get("email")),password:String(f.get("password"))});setBusy(false);if(res.error){setError(res.error.message??"로그인 실패");return;}router.push("/characters");router.refresh();}
 return <main className="mx-auto flex min-h-[75vh] max-w-md items-center px-5 py-16"><form onSubmit={submit} className="glass w-full rounded-3xl p-7"><h1 className="text-2xl font-semibold">로그인</h1><div className="mt-7 space-y-4"><input required name="email" type="email" placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"/><input required name="password" type="password" placeholder="password" className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"/></div>{error&&<p className="mt-4 text-sm text-red-400">{error}</p>}<button disabled={busy} className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-medium text-black">{busy?"확인 중…":"로그인"}</button><p className="mt-5 text-center text-xs text-zinc-500">계정이 없으면 <Link href="/signup" className="text-zinc-200">가입</Link></p></form></main> }
