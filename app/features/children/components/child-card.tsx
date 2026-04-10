import { Settings } from "lucide-react";
import { Link } from "react-router";
import type { ChildDetail } from "../queries";

interface ChildCardProps {
  child: NonNullable<ChildDetail>;
  profileImageUrl?: string | null;
}

export default function ChildCard({ child, profileImageUrl }: ChildCardProps) {
  // 생년월일 포맷팅
  const formatBirthDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}. ${month}. ${day}`;
  };

  return (
    <div className="flex w-full p-4 items-center gap-2">
      <div className="flex items-center gap-2 flex-1 self-stretch">
        {/* 프로필 이미지 */}
        <div className="size-12 aspect-square rounded-full bg-muted overflow-hidden">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={child.nickname}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        {/* 자녀 정보 */}
        <div className="flex flex-col justify-center items-start gap-2 flex-1">
          <div className="flex justify-between items-center self-stretch">
            <span className="text-base font-bold leading-[100%] tracking-[-0.4px]">
              {child.nickname}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {child.name && (
              <span className="text-sm leading-[100%] tracking-[-0.4px] text-muted-foreground">
                {child.name}
              </span>
            )}
            <span className="text-sm leading-[100%] tracking-[-0.4px] text-muted-foreground">
              {formatBirthDate(child.birthDate)}
            </span>
          </div>
        </div>
      </div>

      {/* 설정 아이콘 */}
      <Link to={`/children/${child.code}/edit`} prefetch="intent">
        <Settings size={24} className="text-muted-foreground" />
      </Link>
    </div>
  );
}
