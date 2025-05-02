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
      {/* <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col justify-center items-center gap-1 self-stretch">
          <span className="text-[64px] italic font-bold text-secondary font-arimo">
            KEND
          </span>
          <span className="text-base italic font-bold font-arimo text-center leading-4.5 text-secondary">
            Kids are an END USER
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-center font-semibold leading-[22px] text-white text-base font-pretendard">
            For the Kids, By the kids, To the kids
          </span>
          <span className="text-white font-pretendard">
            아이만을 위한 쇼핑을 시작하세요!
          </span>
        </div>
      </div> */}

      {/* <div className="flex px-6 flex-col items-center gap-8">
        <div className="flex flex-col items-start gap-6 self-stretch">
          <div className="flex flex-col justify-center items-center gap-2 self-stretch">
            <span className="text-center font-pretendard text-xl font-semibold leading-6.5 -tracking-[0.3px] text-white">
              로그인 하기
            </span>

            <span className="text-center font-pretendard leading-[22.4px] -tracking-[0.3px]">
              아직 회원이 아니신가요?{" "}
              <span className="font-semibold text-secondary font-pretendard">
                가입하기
              </span>
            </span>
          </div>

          <div className="flex flex-col items-start gap-4 self-stretch">
            <div className="flex h-16 px-4 flex-col justify-center items-center gap-1 self-stretch">
              <Input className="border-b-1" />
            </div>
            <div className="flex h-16 flex-col items-start gap-2.5 self-stretch">
              <div className="flex px-4 flex-col justify-center items-center gap-1 grow shrink-0 basis-0 self-stretch">
                <Input className="rounded-[20px]" />
              </div>
            </div>
          </div>
        </div>

        <div></div>
      </div> */}
    </div>
  );
}
