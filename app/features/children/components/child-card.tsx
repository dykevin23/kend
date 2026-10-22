import { Settings } from "lucide-react";
import { Link } from "react-router";
import type { ChildDetail } from "../queries";

interface ChildCardProps {
  child: NonNullable<ChildDetail>;
  profileImageUrl?: string | null;
}

// 생후 개월 수 — 24개월 이상은 "N세" (성장 그래프 축 표기와 동일 규칙)
function formatAge(dateStr: string) {
  const birth = new Date(dateStr);
  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  months = Math.max(0, months);
  return months < 24 ? `생후 ${months}개월` : `${Math.floor(months / 12)}세`;
}

export default function ChildCard({ child, profileImageUrl }: ChildCardProps) {
  return (
    <div className="flex w-full items-center gap-2.5 px-5 pt-4 pb-1.5">
      {/* 프로필 이미지 */}
      <div className="size-[38px] shrink-0 rounded-full bg-navy-100 overflow-hidden">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={child.nickname}
            className="size-full object-cover"
          />
        ) : null}
      </div>

      {/* 자녀 정보 */}
      <div className="flex flex-1 min-w-0 items-baseline gap-1.5">
        <span className="text-lg font-extrabold text-gray-900 truncate">
          {child.nickname}
        </span>
        <span className="shrink-0 text-[13px] font-semibold text-gray-500">
          · {formatAge(child.birthDate)}
        </span>
      </div>

      {/* 설정 아이콘 */}
      <Link
        to={`/children/${child.code}/edit`}
        prefetch="intent"
        className="flex size-9 items-center justify-center text-gray-400"
        aria-label="자녀 정보 수정"
      >
        <Settings className="size-5" strokeWidth={1.8} />
      </Link>
    </div>
  );
}
