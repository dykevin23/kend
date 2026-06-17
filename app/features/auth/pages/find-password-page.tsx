import { z } from "zod";
import { Form, Link, useActionData, useNavigation } from "react-router";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/find-password-page";

// 비밀번호 찾기 — 로그인 없이, 입력한 이메일로 재설정 링크 발송.
// 이메일 존재 여부/계정 유형은 노출하지 않는다(열거 방지) → 항상 "보냈어요"로 응답.
// 소셜 가입자가 자기 소셜 이메일로 재설정하면 비밀번호가 추가되어 이메일 로그인도 가능해짐(허용).

const schema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요."),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const result = schema.safeParse({
    email: formData.get("email")?.toString().trim() ?? "",
  });
  if (!result.success) {
    return { error: result.error.errors[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { client } = makeSSRClient(request);
  await client.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${process.env.REDIRECT_LOGIN_URL}/auth/reset-password`,
  });

  // 존재 여부와 무관하게 동일 응답 (이메일 열거 방지)
  return { sent: true };
}

export default function FindPasswordPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const sent = actionData?.sent === true;

  return (
    <div
      className="flex flex-col min-h-screen bg-primary/50"
      style={{
        paddingTop: "max(3.125rem, var(--safe-area-inset-top))",
        paddingBottom: "max(1.5rem, var(--safe-area-inset-bottom))",
      }}
    >
      <div className="flex w-full flex-col items-center gap-4 px-6">
        <span className="text-center font-arimo text-[40px] font-bold italic leading-[100%] text-secondary">
          KEND
        </span>
      </div>

      <div className="flex w-full flex-col items-start gap-8 pt-10 px-6 flex-1">
        <div className="flex flex-col gap-2 self-stretch">
          <span className="text-xl leading-[130%] tracking-[-0.4px] text-secondary text-center">
            비밀번호 재설정
          </span>
          <span className="text-sm leading-[140%] text-center text-muted-foreground">
            가입한 이메일로 재설정 링크를 보내드려요.
          </span>
        </div>

        {sent ? (
          <div className="flex flex-col gap-6 self-stretch">
            <div className="flex flex-col gap-2 px-4 py-5 rounded-lg bg-white">
              <span className="text-base leading-[150%]">
                입력하신 이메일이 가입되어 있다면 재설정 링크를 보냈어요. 메일함을
                확인해 새 비밀번호를 설정해주세요.
              </span>
            </div>
            <Link to="/auth/login">
              <Button
                variant="secondary"
                className="w-full h-14 rounded-full text-base"
              >
                로그인하러 가기
              </Button>
            </Link>
          </div>
        ) : (
          <Form method="post" className="flex flex-col gap-6 self-stretch">
            <TextField
              label="이메일 주소"
              name="email"
              type="email"
              id="email"
              placeholder="가입한 이메일을 입력해주세요"
              required
            />
            {actionData?.error && (
              <div className="flex w-full px-4 py-3 rounded-lg bg-red-100 border border-red-400">
                <span className="text-sm text-red-700">{actionData.error}</span>
              </div>
            )}
            <Button
              type="submit"
              variant="secondary"
              disabled={submitting}
              className={cn(
                "w-full h-14 rounded-full text-base",
                submitting && "opacity-60"
              )}
            >
              {submitting ? "전송 중..." : "재설정 링크 받기"}
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}
