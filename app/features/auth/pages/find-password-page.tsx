import { z } from "zod";
import { Form, Link, useActionData, useNavigation } from "react-router";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/find-password-page";
import AuthLayout, { AuthError, AuthNotice } from "../components/auth-layout";

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
    <AuthLayout
      title="비밀번호 재설정"
      subtitle="가입한 이메일로 재설정 링크를 보내드려요."
      logoSize="sm"
    >
      {sent ? (
        <>
          <AuthNotice>
            입력하신 이메일이 가입되어 있다면 재설정 링크를 보냈어요. 메일함을
            확인해 새 비밀번호를 설정해주세요.
          </AuthNotice>
          <Button asChild size="lg" className="w-full">
            <Link to="/auth/login">로그인하러 가기</Link>
          </Button>
        </>
      ) : (
        <Form method="post" className="flex flex-col gap-4">
          <TextField
            label="이메일 주소"
            name="email"
            type="email"
            id="email"
            placeholder="가입한 이메일을 입력해주세요"
            containerClassName="p-0"
            required
          />
          {actionData?.error && <AuthError message={actionData.error} />}
          <Button type="submit" size="lg" disabled={submitting} className="w-full">
            {submitting ? "전송 중..." : "재설정 링크 받기"}
          </Button>
        </Form>
      )}
      <Link
        to="/auth/login"
        className="text-center text-[13px] font-semibold text-gray-500"
      >
        로그인으로 돌아가기
      </Link>
    </AuthLayout>
  );
}
