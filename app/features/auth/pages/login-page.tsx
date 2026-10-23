import { z } from "zod";
import InputInnerLabel from "~/common/components/input-inner-label";
import { Button } from "~/common/components/ui/button";
import SocialButtons from "../components/social-buttons";
import { Form, Link, redirect, useActionData, useSearchParams } from "react-router";
import { makeSSRClient } from "~/supa-client";
import { actionErrorResponse } from "~/lib/error-handler";
import type { Route } from "./+types/login-page";
import AuthLayout, { AuthError } from "../components/auth-layout";

const loginSchema = z.object({
  email: z.string().min(1, "이메일을 입력해주세요.").email("올바른 이메일 형식을 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const result = loginSchema.safeParse({
    email: formData.get("email")?.toString().trim() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });

  if (!result.success) {
    const firstError = result.error.errors[0]?.message ?? "입력값을 확인해주세요.";
    return { error: firstError };
  }

  const { email, password } = result.data;
  const { client, headers } = makeSSRClient(request);

  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return actionErrorResponse(error);
  }

  return redirect("/", {
    headers,
  });
}

const errorMessages: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않아요.",
  naver_token_failed: "네이버 로그인에 실패했어요. 다시 시도해주세요.",
  naver_profile_failed: "네이버 로그인에 실패했어요. 다시 시도해주세요.",
  naver_create_failed: "네이버 로그인에 실패했어요. 다시 시도해주세요.",
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const urlError = searchParams.get("error");
  const errorMessage =
    actionData?.error ?? (urlError ? errorMessages[urlError] : undefined);
  return (
    <AuthLayout title="로그인" bottom={<SocialButtons />}>
      <Form method="post" className="flex flex-col gap-3">
        <InputInnerLabel label="이메일 주소" name="email" type="email" />
        <InputInnerLabel label="비밀번호" name="password" type="password" />

        {errorMessage && <AuthError message={errorMessage} />}

        <Button type="submit" size="lg" className="w-full mt-1">
          로그인
        </Button>
      </Form>

      <div className="flex items-center justify-center gap-3 text-[13px] font-semibold">
        <Link to="/auth/find-password" className="text-gray-500">
          비밀번호 재설정
        </Link>
        <span className="text-gray-300">|</span>
        <Link to="/auth/join" className="text-primary">
          회원가입
        </Link>
      </div>
    </AuthLayout>
  );
}
