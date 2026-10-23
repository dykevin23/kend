import { Link } from "react-router";
import Apple from "~/assets/icons/apple";
import Google from "~/assets/icons/google";
import Kakao from "~/assets/icons/kakao";
import Naver from "~/assets/icons/naver";

const SOCIAL_LOGINS = [
  { to: "/auth/naver/start", label: "네이버로 로그인", icon: <Naver /> },
  { to: "/auth/social/kakao/start", label: "카카오로 로그인", icon: <Kakao /> },
  { to: "/auth/social/apple/start", label: "Apple로 로그인", icon: <Apple /> },
  { to: "/auth/social/google/start", label: "Google로 로그인", icon: <Google /> },
];

export default function SocialButtons() {
  return (
    <div className="flex w-full flex-col gap-4">
      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-semibold text-gray-500">간편 로그인</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="flex justify-center gap-4">
        {SOCIAL_LOGINS.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className="flex size-[52px] items-center justify-center rounded-full bg-white shadow-card-sm"
          >
            {icon}
          </Link>
        ))}
      </div>
    </div>
  );
}
