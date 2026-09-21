import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/session";

export const metadata = { title: "가입" };

export const instant = false;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await getSession()) redirect((next as "/") ?? "/");
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-heading font-medium tracking-tight">계정 만들기</h1>
        <p className="text-muted-foreground text-sm">
          가입하면 대화 기록과 요약 메모리가 계정에 저장됩니다.
        </p>
      </div>
      <AuthForm mode="signup" next={next} />
    </div>
  );
}
