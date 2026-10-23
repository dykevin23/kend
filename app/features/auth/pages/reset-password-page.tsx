import { z } from "zod";
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/reset-password-page";
import AuthLayout, { AuthError, AuthNotice } from "../components/auth-layout";

// 비밀번호 재설정 페이지 — 이메일 재설정 링크의 도착지.
//
// loader: 링크의 `code` 를 세션으로 교환(소셜 로그인 콜백과 동일 패턴) →
//         세션 쿠키를 심고 code 를 URL 에서 제거하기 위해 자기 자신으로 redirect.
//         이미 세션(복구 세션)이 있으면 폼을 렌더.
// action: 새 비밀번호로 updateUser → 로그아웃 후 로그인 화면으로.

const schema = z
  .object({
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 해요."),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "비밀번호가 일치하지 않아요.",
    path: ["passwordConfirm"],
  });

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");

  // 1순위: token_hash 방식(무상태) — PKCE verifier 쿠키에 의존하지 않아
  // 외부 브라우저/다른 기기에서 메일 링크를 열어도 동작. (WebView 앱 대응)
  if (tokenHash && type) {
    const { error } = await client.auth.verifyOtp({
      type: type as "recovery",
      token_hash: tokenHash,
    });
    if (error) return { valid: false };
    // 세션 쿠키 세팅 + 토큰 파라미터 제거를 위해 깨끗한 URL 로 redirect
    return redirect("/auth/reset-password", { headers });
  }

  // 2순위(fallback): PKCE code 방식 (같은 브라우저에서만 동작)
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) return { valid: false };
    return redirect("/auth/reset-password", { headers });
  }

  // 파라미터 없이 들어온 경우: 복구 세션이 살아있으면 폼 노출, 아니면 무효 링크
  const {
    data: { user },
  } = await client.auth.getUser();
  return { valid: !!user };
};

export async function action({ request }: Route.ActionArgs) {
  const { client, headers } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return { error: "세션이 만료되었어요. 재설정 링크를 다시 요청해주세요." };
  }

  const formData = await request.formData();
  const result = schema.safeParse({
    password: formData.get("password")?.toString() ?? "",
    passwordConfirm: formData.get("passwordConfirm")?.toString() ?? "",
  });
  if (!result.success) {
    return { error: result.error.errors[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { error } = await client.auth.updateUser({
    password: result.data.password,
  });
  if (error) {
    return { error: "비밀번호 변경에 실패했어요. 다시 시도해주세요." };
  }

  // 복구 세션 종료 후 새 비밀번호로 로그인하도록 유도
  await client.auth.signOut();
  return redirect("/auth/login", { headers });
}

export default function ResetPasswordPage() {
  const { valid } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <AuthLayout title="비밀번호 재설정" logoSize="sm">
      {!valid ? (
        <>
          <AuthNotice>
            유효하지 않거나 만료된 링크예요. 재설정을 다시 요청해주세요.
          </AuthNotice>
          <Button asChild size="lg" className="w-full">
            <Link to="/auth/find-password">다시 요청하기</Link>
          </Button>
        </>
      ) : (
        <Form method="post" className="flex flex-col gap-4">
          <TextField
            label="새 비밀번호"
            name="password"
            type="password"
            id="password"
            placeholder="6자 이상"
            containerClassName="p-0"
            required
          />
          <TextField
            label="새 비밀번호 확인"
            name="passwordConfirm"
            type="password"
            id="passwordConfirm"
            containerClassName="p-0"
            required
          />
          {actionData?.error && <AuthError message={actionData.error} />}
          <Button type="submit" size="lg" disabled={submitting} className="w-full">
            {submitting ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </Form>
      )}
    </AuthLayout>
  );
}
