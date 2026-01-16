import InputInnerLabel from "~/common/components/input-inner-label";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import SocialButtons from "../components/social-buttons";
import { Form, Link } from "react-router";

export default function LoginPage() {
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
          {/* 로그인 타이틀 & 가입하기 링크 */}
          <div className="flex flex-col items-start gap-6 self-stretch">
            <div className="flex flex-col justify-center items-center gap-2 self-stretch">
              <span className="text-center text-xl leading-[130%] tracking-[-0.4px] text-secondary self-stretch">
                로그인 하기
              </span>
              <div className="flex justify-center self-stretch">
                <span className="text-center text-base leading-[140%] tracking-[-0.4px]">
                  아직 회원이 아니신가요?{" "}
                </span>
                <Link to="/auth/join">
                  <span className="text-base leading-[140%] tracking-[-0.4px] text-secondary underline">
                    가입하기
                  </span>
                </Link>
              </div>
            </div>

            {/* 입력 필드 & 로그인 버튼 */}
            <Form method="post" className="flex flex-col items-start gap-6 self-stretch">
              <div className="flex flex-col items-start self-stretch rounded-2xl">
                <InputInnerLabel
                  label="이메일 주소"
                  name="email"
                  type="email"
                  placeholder="KEND@gmail.com"
                  className="rounded-t-2xl rounded-b-none -mb-px"
                />
                <InputInnerLabel
                  label="비밀번호"
                  name="password"
                  type="password"
                  placeholder="●●●●●●"
                  className="rounded-b-2xl rounded-t-none"
                />
              </div>

              {/* 로그인 버튼 & 찾기 링크 */}
              <div className="flex flex-col items-center gap-6 self-stretch">
                <Button
                  type="submit"
                  variant="secondary"
                  className={cn(
                    "w-full h-14 py-2 px-4 flex justify-center items-center rounded-full",
                    "text-base font-normal leading-[100%] tracking-[-0.4px]"
                  )}
                >
                  로그인
                </Button>
                <div className="flex items-center gap-6">
                  <Link to="/auth/find-id">
                    <span className="text-center text-sm leading-[140%] tracking-[-0.4px] text-secondary">
                      아이디 찾기
                    </span>
                  </Link>
                  <Link to="/auth/find-password">
                    <span className="text-center text-sm leading-[140%] tracking-[-0.4px] text-secondary">
                      비밀번호 찾기
                    </span>
                  </Link>
                </div>
              </div>
            </Form>
          </div>
        </div>

        {/* 소셜 로그인 & 약관 */}
        <div className="flex flex-col items-center gap-6 self-stretch mt-auto pb-6">
          <SocialButtons />
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
