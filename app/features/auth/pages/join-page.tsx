import { Form, Link, redirect } from "react-router";
import FloatingLabelInput from "~/common/components/floatingLabelInput";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import SocialButtons from "../components/social-buttons";
import type { Route } from "./+types/join-page";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";
import { checkNicknameExists } from "../queries";

const formSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  nickname: z.string().min(3),
  password: z.string().min(8),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return {
      formErrors: error.flatten().fieldErrors,
    };
  }

  const { client, headers } = makeSSRClient(request);
  const nicknameExists = await checkNicknameExists(client, {
    nickname: data.nickname,
  });
  if (nicknameExists) {
    return {
      formErrors: { username: ["Username already exists"] },
    };
  }

  const { error: signUpError } = await client.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        username: data.username,
        nickname: data.nickname,
      },
    },
  });
  if (signUpError) {
    return {
      signUpError: signUpError.message,
    };
  }

  return redirect("/", { headers });
};

export default function JoinPage({ actionData }: Route.ComponentProps) {
  return (
    <div className="bg-primary h-full space-y-10 py-[50px]">
      {/* 상단 로고 영역 start */}
      <div className="flex w-full flex-col items-center gap-4 pt-6">
        {/* 로고 */}
        <div className="flex flex-col justify-center items-center gap-1 self-stretch">
          <span className="text-center text-[64px] font-arimo italic font-bold leading-none text-primary-foreground">
            KEND
          </span>

          <span className="text-center text-base font-arimo italic font-bold leading-4.5 text-primary-foreground">
            Kids are an END USER
          </span>
        </div>
      </div>
      {/* 상단 로고 영역 end */}

      {/* 입력 area */}
      <Form
        className="flex w-full px-6 flex-col items-center gap-8"
        method="post"
      >
        <div className="flex flex-col items-start gap-6 self-stretch">
          <div className="flex flex-col justify-center items-center gap-2 self-stretch">
            <div className="flex flex-col justify-center items-center gap-6 self-stretch">
              <span className="text-center font-pretendard text-xl not-italic font-semibold leading-6.5 tracking-[-0.3px] text-white self-stretch">
                회원가입
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-center font-pretendard text-base not-italic font-normal leading-[22.4px] tracking-[-0.3px] text-sky-500/60">
                이미 계정이 있으신가요?{" "}
              </span>
              <Button
                asChild
                variant="ghost"
                className="text-center font-pretendard text-base not-italic leading-[22.4px] tracking-[-0.3px] font-semibold text-primary-foreground"
              >
                <Link to="/auth/login">로그인 하기</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-start self-stretch space-y-4">
            <FloatingLabelInput
              id="email"
              name="email"
              label="이메일 주소"
              className="rounded-2xl border-b"
            />
            {actionData && "formErrors" in actionData && (
              <p className="text-sm text-red-500">
                {actionData?.formErrors?.email}
              </p>
            )}
            <FloatingLabelInput
              id="username"
              name="username"
              label="이름"
              className="rounded-2xl border-b"
            />
            {actionData && "formErrors" in actionData && (
              <p className="text-sm text-red-500">
                {actionData?.formErrors?.username}
              </p>
            )}
            <FloatingLabelInput
              id="nickname"
              name="nickname"
              label="닉네임"
              className="rounded-2xl border-b"
            />
            {actionData && "formErrors" in actionData && (
              <p className="text-sm text-red-500">
                {actionData?.formErrors?.nickname}
              </p>
            )}
            <FloatingLabelInput
              id="password"
              name="password"
              label="비밀번호"
              type="password"
              className="rounded-2xl border-b"
            />
            {actionData && "formErrors" in actionData && (
              <p className="text-sm text-red-500">
                {actionData?.formErrors?.password}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-6 self-stretch">
          <div className="flex flex-col items-start gap-2.5 self-stretch">
            <Button
              className={cn(
                "flex w-full h-14 px-4 py-2.25 justify-center items-center gap-1.5",
                "rounded-full bg-secondary",
                "font-pretendard text-base not-italic font-semibold leading-none tracking-[-0.3px] text-secondary-foreground"
              )}
              type="submit"
            >
              회원가입
            </Button>
            {actionData && "signUpError" in actionData && (
              <p className="text-sm text-red-500">{actionData.signUpError}</p>
            )}
          </div>
        </div>
      </Form>

      {/* social login */}
      <SocialButtons />
    </div>
  );
}
