import { Form, Link, redirect } from "react-router";
import FloatingLabelInput from "~/common/components/floatingLabelInput";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import SocialButtons from "../components/social-buttons";
import type { Route } from "./+types/login-page";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";

const formSchema = z.object({
  email: z
    .string({
      required_error: "이메일을 입력해주세요.",
    })
    .email("이메일 형식이 아닙니다."),
  password: z
    .string({
      required_error: "비밀번호를 입력해주세요.",
    })
    .min(8, { message: "비밀번호는 최소 8자리 이상 입력해야합니다." }),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );
  if (!success) {
    return {
      formErrors: error.flatten().fieldErrors,
      loginError: null,
    };
  }

  const { email, password } = data;
  const { client, headers } = makeSSRClient(request);
  const { error: loginError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (loginError) {
    return {
      formErrors: null,
      loginError: loginError.message,
    };
  }
  return redirect("/", { headers });
};

export default function LoginPage({ actionData }: Route.ComponentProps) {
  return (
    <div className="bg-primary space-y-10 py-[50px] ">
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

        {/* 메세지 영역 */}
        <div className="flex flex-col items-center gap-2 self-stretch">
          <span className="text-center font-pretendard text-base not-italic font-semibold leading-5.5 text-white">
            For the Kids, By the kids, To the kids
          </span>

          <span className="text-center font-pretendard text-base not-italic font-normal leading-none text-white">
            아이만을 위한 쇼핑을 시작하세요!
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
                로그인 하기
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-center font-pretendard text-base not-italic font-normal leading-[22.4px] tracking-[-0.3px] text-sky-500/60">
                아직 회원이 아니신가요?{" "}
              </span>
              <Button
                asChild
                variant="ghost"
                className="text-center font-pretendard text-base not-italic leading-[22.4px] tracking-[-0.3px] font-semibold text-primary-foreground"
              >
                <Link to="/auth/join">가입하기</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-start self-stretch">
            <FloatingLabelInput
              id="email"
              name="email"
              label="이메일 주소"
              className="rounded-t-2xl rounded-b-none border-b"
            />
            <FloatingLabelInput
              id="password"
              name="password"
              label="비밀번호"
              className="rounded-b-2xl rounded-t-none border-t-0"
            />
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
              로그인
            </Button>
          </div>

          <div className="flex items-start gap-6">
            <Button
              asChild
              variant="ghost"
              className="text-accent/50 text-center font-pretendard text-sm not-italic font-normal leading-[19.6px] tracking-[-0.3px]"
            >
              <Link to="/auth/findId">아이디 찾기</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-accent/50 text-center font-pretendard text-sm not-italic font-normal leading-[19.6px] tracking-[-0.3px]"
            >
              <Link to="/auth/findPw">비밀번호 찾기</Link>
            </Button>
          </div>
        </div>
      </Form>

      <div className="flex flex-col w-full items-center gap-6">
        {/* social login */}
        <SocialButtons />

        <div className="flex items-start gap-6">
          <span className="text-center font-pretendard text-sm not-italic font-normal leading-[19.6px] tracking-[-0.3px] text-muted/50">
            이용약관
          </span>
          <span className="text-center font-pretendard text-sm not-italic font-normal leading-[19.6px] tracking-[-0.3px] text-muted/50">
            개인정보처리방침
          </span>
        </div>
      </div>
    </div>
  );
}
