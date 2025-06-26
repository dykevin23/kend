import { Form, Link } from "react-router";
import FloatingLabelInput from "~/common/components/floatingLabelInput";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";

export default function LoginPage() {
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
      <Form className="flex w-full px-6 flex-col items-center gap-8">
        <div className="flex flex-col items-start gap-6 self-stretch">
          <div className="flex flex-col justify-center items-center gap-2 self-stretch">
            <div className="flex flex-col justify-center items-center gap-6 self-stretch">
              <span className="text-center font-pretendard text-xl not-italic font-semibold leading-6.5 tracking-[-0.3px] text-white self-stretch">
                로그인 하기
              </span>
            </div>

            <span className="text-center font-pretendard text-base not-italic font-normal leading-[22.4px] tracking-[-0.3px] text-sky-500/60">
              아직 회원이 아니신가요?{" "}
              <span className="font-semibold text-primary-foreground">
                가입하기
              </span>
            </span>
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

      {/* social login */}
      <div className="flex flex-col w-full items-center gap-6">
        <div className="flex px-6 justify-between items-center self-stretch">
          <Link to="">
            <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <g clip-path="url(#clip0_1_601)">
                  <path
                    d="M13.5614 10.7033L6.14609 0H0V20H6.43861V9.295L13.8539 20H20V0H13.5614V10.7033Z"
                    fill="#03C75A"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1_601">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </Link>
          <Link to="">
            <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
              >
                <g clip-path="url(#clip0_1_603)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.0001 0.733337C4.92457 0.733337 0 4.53806 0 9.23057C0 12.1489 1.90472 14.7216 4.80521 16.2518L3.58483 20.7099C3.477 21.1039 3.92752 21.4178 4.27347 21.1896L9.62301 17.6589C10.0745 17.7025 10.5332 17.7279 11.0001 17.7279C17.0751 17.7279 22 13.9233 22 9.23057C22 4.53806 17.0751 0.733337 11.0001 0.733337Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1_603">
                    <rect width="22" height="22" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </Link>
          <Link to="">
            <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="24"
                viewBox="0 0 20 24"
                fill="none"
              >
                <path
                  d="M19.5808 18.7033C19.2218 19.5418 18.7967 20.3136 18.3043 21.0232C17.633 21.9906 17.0834 22.6602 16.6598 23.032C16.0032 23.6424 15.2997 23.955 14.5464 23.9728C14.0056 23.9728 13.3534 23.8172 12.5942 23.5017C11.8325 23.1876 11.1325 23.032 10.4925 23.032C9.82119 23.032 9.10128 23.1876 8.33123 23.5017C7.56002 23.8172 6.93874 23.9816 6.46373 23.9979C5.74132 24.0291 5.02125 23.7076 4.30251 23.032C3.84376 22.6276 3.26997 21.9343 2.58259 20.9521C1.84508 19.9033 1.23875 18.687 0.76374 17.3004C0.25502 15.8026 0 14.3523 0 12.9482C0 11.3398 0.343837 9.95259 1.03254 8.79011C1.57379 7.85636 2.29386 7.11979 3.19508 6.57906C4.09629 6.03834 5.07006 5.76279 6.11872 5.74516C6.69251 5.74516 7.44497 5.92456 8.38004 6.27715C9.31247 6.63091 9.91118 6.81032 10.1737 6.81032C10.3699 6.81032 11.035 6.60054 12.1625 6.18233C13.2288 5.79449 14.1287 5.63391 14.8659 5.69716C16.8636 5.86012 18.3644 6.6561 19.3625 8.09013C17.5758 9.18432 16.6921 10.7169 16.7097 12.6829C16.7258 14.2142 17.2754 15.4886 18.3556 16.5004C18.8451 16.97 19.3918 17.333 20 17.5907C19.8681 17.9774 19.7289 18.3477 19.5808 18.7033ZM14.9993 0.480137C14.9993 1.68041 14.5654 2.8011 13.7007 3.8384C12.6572 5.07155 11.395 5.78412 10.0262 5.67168C10.0088 5.52769 9.99868 5.37614 9.99868 5.21688C9.99868 4.06462 10.4949 2.83147 11.3762 1.82321C11.8162 1.3127 12.3758 0.888228 13.0544 0.549615C13.7315 0.216055 14.372 0.031589 14.9744 0C14.9919 0.160458 14.9993 0.320941 14.9993 0.480137Z"
                  fill="black"
                />
              </svg>
            </div>
          </Link>
          <Link to="">
            <div className="flex size-13.5 justify-center items-center rounded-full bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M21.56 11.2499C21.56 10.4699 21.49 9.71994 21.36 8.99994H11V13.2549H16.92C16.665 14.6299 15.89 15.7949 14.725 16.5749V19.3349H18.28C20.36 17.4199 21.56 14.5999 21.56 11.2499Z"
                  fill="#4285F4"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.9999 21.9998C13.9699 21.9998 16.4599 21.0148 18.2799 19.3348L14.7249 16.5748C13.7399 17.2348 12.4799 17.6248 10.9999 17.6248C8.13492 17.6248 5.70992 15.6898 4.84492 13.0898H1.16992V15.9398C2.97992 19.5348 6.69992 21.9998 10.9999 21.9998Z"
                  fill="#34A853"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M4.845 13.0901C4.625 12.4301 4.5 11.7251 4.5 11.0001C4.5 10.2751 4.625 9.57012 4.845 8.91012V6.06012H1.17C0.425 7.54512 0 9.22512 0 11.0001C0 12.7751 0.425 14.4551 1.17 15.9401L4.845 13.0901Z"
                  fill="#FBBC05"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.9999 4.375C12.6149 4.375 14.0649 4.93 15.2049 6.02L18.3599 2.865C16.4549 1.09 13.9649 0 10.9999 0C6.69992 0 2.97992 2.465 1.16992 6.06L4.84492 8.91C5.70992 6.31 8.13492 4.375 10.9999 4.375Z"
                  fill="#EA4335"
                />
              </svg>
            </div>
          </Link>
        </div>

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
