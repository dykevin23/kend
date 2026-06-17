import { z } from "zod";
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/reset-password-page";

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
        </div>

        {!valid ? (
          <div className="flex flex-col gap-6 self-stretch">
            <div className="flex flex-col gap-2 px-4 py-5 rounded-lg bg-white">
              <span className="text-base leading-[150%]">
                유효하지 않거나 만료된 링크예요. 재설정을 다시 요청해주세요.
              </span>
            </div>
            <Link to="/auth/find-password">
              <Button
                variant="secondary"
                className="w-full h-14 rounded-full text-base"
              >
                다시 요청하기
              </Button>
            </Link>
          </div>
        ) : (
          <Form method="post" className="flex flex-col gap-6 self-stretch">
            <TextField
              label="새 비밀번호"
              name="password"
              type="password"
              id="password"
              placeholder="6자 이상"
              required
            />
            <TextField
              label="새 비밀번호 확인"
              name="passwordConfirm"
              type="password"
              id="passwordConfirm"
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
              {submitting ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}
