import { Link } from "react-router";
import { cn } from "~/lib/utils";

interface AuthLayoutProps {
  title: string;
  subtitle?: React.ReactNode;
  /** 로그인·가입은 큰 로고 + 슬로건, 비밀번호 화면은 작은 로고 */
  logoSize?: "lg" | "sm";
  children: React.ReactNode;
  /** 카드 아래 영역 (소셜 로그인 등) — 화면 하단에 붙는다 */
  bottom?: React.ReactNode;
  className?: string;
}

/**
 * 인증 화면 공통 틀 — 크림 배경 + KEND 로고 + 폼 + 약관 링크.
 * 노치/홈바 여백(safe-area)도 여기서 처리한다.
 */
export default function AuthLayout({
  title,
  subtitle,
  logoSize = "lg",
  children,
  bottom,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn("flex flex-col min-h-screen bg-orange-100/50", className)}
      style={{
        paddingTop: "max(3rem, var(--safe-area-inset-top))",
        paddingBottom: "max(1.5rem, var(--safe-area-inset-bottom))",
      }}
    >
      {/* 로고 */}
      <div className="flex flex-col items-center gap-1 px-5">
        <span
          className={cn(
            "font-arimo font-bold italic leading-none text-primary",
            logoSize === "lg" ? "text-[52px]" : "text-[36px]"
          )}
        >
          KEND
        </span>
        {logoSize === "lg" && (
          <span className="font-arimo text-sm font-bold italic text-primary">
            Kids are an ENDuser
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6 px-5 pt-8">
        {/* 타이틀 */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[22px] font-extrabold tracking-[-0.4px] text-gray-900">
            {title}
          </span>
          {subtitle && (
            <span className="text-sm text-center text-gray-500">{subtitle}</span>
          )}
        </div>

        {/* 폼 — 카드 없이 크림 바탕에 바로 (흰 카드는 크림과 톤이 겉돌아서) */}
        <div className="flex flex-col gap-4">{children}</div>

        {/* 하단 영역 + 약관 */}
        <div className="flex flex-col items-center gap-6 mt-auto pt-4">
          {bottom}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <Link to="/terms">이용약관</Link>
            <span className="text-gray-300">|</span>
            <Link to="/privacy">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 폼 에러 메시지 박스 */
export function AuthError({ message }: { message: string }) {
  return (
    <div className="px-4 py-3 rounded-xl bg-white border border-red-200">
      <span className="text-[13px] text-destructive">{message}</span>
    </div>
  );
}

/** 안내 문구 박스 (메일 발송 완료, 만료된 링크 등) */
export function AuthNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-4 rounded-xl bg-white">
      <span className="text-sm leading-[1.6] text-gray-700">{children}</span>
    </div>
  );
}
