import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";

export default function LoginPage() {
  return (
    <div className="bg-primary h-[812px] pt-[50px]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col justify-center items-center gap-1">
          <span className="text-[64px] italic font-bold text-secondary font-arimo leading-16 text-center">
            KEND
          </span>
          <span className="text-base italic font-bold font-arimo text-center leading-4.5 text-secondary">
            Kids are an END USER
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-white text-center font-pretendard font-semibold leading-5.5">
            For the Kids, By the kids, To the kids
          </span>
          <span className="text-white text-center font-pretendard leading-4">
            아이만을 위한 쇼핑을 시작하세요!
          </span>
        </div>
      </div>

      {/* 입력 area */}
      <div className="flex w-full px-6 flex-col items-center gap-8">
        <div className="flex flex-col items-start gap-6 self-stretch">
          <div className="flex flex-col justify-center items-center gap-2 self-stretch">
            <div className="flex flex-col justify-center items-center gap-6 self-stretch">
              <span className="text-xl font-semibold leading-6.5 -tracking-[0.3px] text-white">
                로그인 하기
              </span>
            </div>
            <span className="text-base leading-5.6 -tracking-[0.3px]">
              아직 회원이 아니신가요?{" "}
              <span className="text-base font-semibold text-secondary">
                가입하기
              </span>
            </span>
          </div>

          <div className="flex flex-col items-start self-stretch">
            <Input />
            <Input />
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 self-stretch">
          <div className="flex w-full h-14 py-[9px] px-4 flex-col justify-center items-center gap-1.5">
            <Button className="bg-secondary w-full h-14 rounded-full text-primary text-base font-semibold -tracking-[0.3px]">
              로그인
            </Button>
          </div>
          <div className="flex items-start gap-6">
            <span className="text-sm leading-[19.6px] -tracking-[0.3px] text-white">
              아이디 찾기
            </span>
            <span className="text-sm leading-[19.6px] -tracking-[0.3px] text-white">
              비밀번호 찾기
            </span>
          </div>
        </div>
      </div>

      {/* social login */}
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex px-6 justify-between items-center self-stretch">
          <Button>
            <img
              src="https://github.com/naver.png"
              alt="naver login"
              className="rounded-full size-13.5"
            />
          </Button>
          <Button>
            <img
              src="https://github.com/kakao.png"
              alt="naver login"
              className="rounded-full size-13.5"
            />
          </Button>
          <Button>
            <img
              src="https://github.com/apple.png"
              alt="naver login"
              className="rounded-full size-13.5"
            />
          </Button>
          <Button>
            <img
              src="https://github.com/google.png"
              alt="naver login"
              className="rounded-full size-13.5"
            />
          </Button>
        </div>

        <div className="flex items-start gap-6">
          <span className="text-sm leading-[19.6px] text-white">이용약관</span>
          <span className="text-sm leading-[19.6px] text-white">
            개인정보처리방침
          </span>
        </div>
      </div>
    </div>
  );
}
