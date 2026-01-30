import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import { Form, Link, redirect, useActionData } from "react-router";
import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/join-page";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;
  const nickname = formData.get("nickname") as string;

  // 유효성 검사
  if (!email || !password || !passwordConfirm || !nickname) {
    return {
      error: "모든 항목을 입력해주세요.",
    };
  }

  if (password !== passwordConfirm) {
    return {
      error: "비밀번호가 일치하지 않습니다.",
    };
  }

  if (password.length < 6) {
    return {
      error: "비밀번호는 최소 6자 이상이어야 합니다.",
    };
  }

  const { client, headers } = makeSSRClient(request);

  // Supabase 회원가입
  const { error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return {
        error: "이미 가입된 이메일 주소입니다.",
      };
    }
    return {
      error: "회원가입에 실패했습니다. 다시 시도해주세요.",
    };
  }

  // 가입 성공 시 홈으로 리디렉션
  return redirect("/", {
    headers,
  });
}

export default function JoinPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div
      className="flex flex-col min-h-screen bg-primary/50"
      style={{
        paddingTop: "max(3.125rem, var(--safe-area-inset-top))",
        paddingBottom: "max(0px, var(--safe-area-inset-bottom))",
      }}
    >
      {/* LOGO start */}
      <div className="flex w-full flex-col items-center gap-4 px-6">
        <div className="flex flex-col justify-center items-center gap-1 self-stretch">
          <span className="text-center font-arimo text-[64px] font-bold italic leading-[100%] text-secondary">
            KEND
          </span>
          <span className="text-center font-arimo text-base italic font-bold leading-[18px] text-secondary">
            Kids are an ENDuser
          </span>
        </div>
      </div>
      {/* LOGO end */}

      <div className="flex w-full flex-col items-start gap-10 pt-10 flex-1">
        <div className="flex px-6 flex-col items-center gap-8 self-stretch">
          {/* 가입 타이틀 & 로그인 링크 */}
          <div className="flex flex-col items-start gap-6 self-stretch">
            <div className="flex flex-col justify-center items-center gap-2 self-stretch">
              <span className="text-center text-xl leading-[130%] tracking-[-0.4px] text-secondary self-stretch">
                가입하기
              </span>
              <div className="flex justify-center self-stretch">
                <span className="text-center text-base leading-[140%] tracking-[-0.4px]">
                  이미 회원이신가요?{" "}
                </span>
                <Link to="/auth/login">
                  <span className="text-base leading-[140%] tracking-[-0.4px] text-secondary underline">
                    로그인하기
                  </span>
                </Link>
              </div>
            </div>

            {/* 입력 필드 & 가입 버튼 */}
            <Form
              method="post"
              className="flex flex-col items-start gap-6 self-stretch"
            >
              {actionData?.error && (
                <div className="flex w-full px-4 py-3 rounded-lg bg-red-100 border border-red-400">
                  <span className="text-sm text-red-700">
                    {actionData.error}
                  </span>
                </div>
              )}

              <div className="flex flex-col items-start self-stretch">
                <TextField
                  label="이메일 주소"
                  name="email"
                  type="email"
                  id="email"
                  required
                />
                <TextField
                  label="비밀번호"
                  name="password"
                  type="password"
                  id="password"
                  required
                />
                <TextField
                  label="비밀번호 확인"
                  name="passwordConfirm"
                  type="password"
                  id="passwordConfirm"
                  required
                />
                <TextField
                  label="닉네임"
                  name="nickname"
                  type="text"
                  id="nickname"
                  required
                />
              </div>

              {/* 가입 버튼 */}
              <div className="flex flex-col items-center gap-6 self-stretch">
                <Button
                  type="submit"
                  variant="secondary"
                  className={cn(
                    "w-full h-14 py-2 px-4 flex justify-center items-center rounded-full",
                    "text-base font-normal leading-[100%] tracking-[-0.4px]"
                  )}
                >
                  가입하기
                </Button>
              </div>
            </Form>
          </div>
        </div>

        {/* 약관 */}
        <div className="flex flex-col items-center gap-6 self-stretch mt-auto pb-6">
          <div className="flex items-center gap-6">
            <Link to="/terms">
              <span className="text-center text-sm leading-[140%] tracking-[-0.4px] text-secondary">
                이용약관
              </span>
            </Link>
            <Link to="/privacy">
              <span className="text-center text-sm leading-[140%] tracking-[-0.4px] text-secondary">
                개인정보처리방침
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
