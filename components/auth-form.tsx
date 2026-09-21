"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = isSignup
      ? await authClient.signUp.email({ name: String(form.get("name") ?? ""), email, password })
      : await authClient.signIn.email({ email, password });

    setBusy(false);
    if (result.error) {
      setError(result.error.message ?? (isSignup ? "가입에 실패했습니다." : "로그인에 실패했습니다."));
      return;
    }
    router.push((next as "/") ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <FieldGroup>
        {isSignup && (
          <Field>
            <FieldLabel htmlFor="name">이름</FieldLabel>
            <Input id="name" name="name" autoComplete="nickname" placeholder="대화에서 불릴 이름" required />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="email">이메일</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">비밀번호</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            placeholder="8자 이상"
            required
          />
          {isSignup && <FieldDescription>8자 이상. 대화 내용은 계정에만 저장됩니다.</FieldDescription>}
        </Field>
      </FieldGroup>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Spinner />}
        {busy ? "확인 중…" : isSignup ? "가입하고 캐릭터 보기" : "로그인"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {isSignup ? "이미 계정이 있으면 " : "계정이 없으면 "}
        <Link href={isSignup ? "/login" : "/signup"} className="text-foreground underline-offset-4 hover:underline">
          {isSignup ? "로그인" : "가입하기"}
        </Link>
      </p>
    </form>
  );
}
