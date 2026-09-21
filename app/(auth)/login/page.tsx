import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/session";

export const metadata = { title: "로그인" };

// Reads the ?next= redirect target, so it renders per request (no skeleton for a 1-screen form).
export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // real check against the session store — the proxy only does an optimistic cookie peek
  if (await getSession()) redirect((next as "/") ?? "/");
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-xl font-semibold">로그인</h1>
        <p className="text-sm text-muted-foreground">이어서 대화하려면 계정이 필요합니다.</p>
      </div>
      <AuthForm mode="login" next={next} />
    </div>
  );
}
