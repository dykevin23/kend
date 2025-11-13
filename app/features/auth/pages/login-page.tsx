import InputInnerLabel from "~/common/components/input-inner-label";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import SocialButtons from "../components/social-buttons";
import { Link } from "react-router";

export default function LoginPage() {
  return (
    <div className="flex flex-col h-max max-h-full pt-12.5 bg-primary/50">
      {/* LOGO start */}
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex flex-col justify-center items-center gap-1 self-stretch">
          <span className="text-center font-arimo text-[64px] font-bold italic leading-[100%] text-secondary">
            KEND
          </span>
          <span className="text-center font-arimo text-base italic font-bold leading-4.5 text-secondary">
            Kids are an ENDuser
          </span>
        </div>
      </div>
      {/* LOGO end */}

      <div className="flex w-full flex-col items-start gap-10 pt-10">
        <div className="flex px-6 flex-col items-center gap-8 self-stretch">
          <div className="flex flex-col items-start gap-6 self-stretch">
            <div className="flex flex-col justify-center items-center gap-2 self-stretch">
              <div className="flex flex-col justify-center items-center gap-6 self-stretch">
                <span className="text-center text-xl leading-[130%] tracking-[-0.4px] text-secondary self-stretch">
                  로그인 하기
                </span>
              </div>
              <div className="flex justify-center self-stretch">
                <span className="text-center text-base leading-[140%] tracking-[-0.4px]">
                  아직 회원이 아니신가요?{" "}
                </span>
                <Link to="/auth/join">
                  <span className="text-base leading-[140%] tracking-[-0.4px] text-secondary">
                    가입하기
                  </span>
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-start self-stretch">
              <InputInnerLabel />
              <InputInnerLabel />
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 self-stretch">
            <div className="flex flex-col items-start gap-2.5 self-stretch">
              <Button
                variant="secondary"
                className={cn(
                  "w-full h-14 py-2 px-4 flex flex-col justify-center items-center gap-1.5 rounded-full",
                  "text-base leading-[100%] tracking-[-0.4px]"
                )}
              >
                로그인
              </Button>
            </div>
            <div className="flex items-start gap-6">
              <span className="text-center text-sm leading-[140%] tracking-[-0.4px] text-secondary">
                아이디 찾기
              </span>
              <span className="text-center text-sm leading-[140%] tracking-[-0.4px] text-secondary">
                비밀번호 찾기
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-6 self-stretch">
          <SocialButtons />
          <div className="flex items-start gap-6">
            <span className="text-center text-sm leading-[140%] tracking-[-0.4px] text-secondary">
              이용약관
            </span>
            <span className="text-center text-sm leading-[140%] tracking-[-0.4px] text-secondary">
              개인정보처리방침
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
