import { ChevronLeft, Home, Search } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "~/lib/utils";
import CartIcon from "./cart-icon";

export interface HeaderProps {
  title?: string;
  useRight?: boolean;
}

export const headerIconButtonClass =
  "relative flex size-[38px] items-center justify-center text-gray-900";

export default function Header({ title, useRight = true }: HeaderProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const naviMenus = ["/stores", "/children", "/likes", "/myPage"];

  const [isNaviMenu] = useState<boolean>(
    naviMenus.includes(pathname) ||
      !isNaN(Number(pathname.split("/children/").at(-1)))
  );

  // 하단 탭 화면: 큰 타이틀 / 서브 화면: 52px 헤더 + 가운데 타이틀
  if (isNaviMenu) {
    return (
      <div className="flex px-5 pt-5 pb-1 justify-between items-center self-stretch bg-white">
        <span className="text-[23px] font-extrabold tracking-[-0.5px] text-gray-900">
          {title}
        </span>
        {useRight && (
          <div className="flex items-center gap-0.5">
            <Link to="/search" className={headerIconButtonClass} aria-label="검색">
              <Search className="size-[22px]" strokeWidth={1.8} />
            </Link>
            <CartIcon />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-13 px-1.5 justify-between items-center self-stretch bg-white border-b border-gray-100">
      <button
        type="button"
        className={headerIconButtonClass}
        onClick={() => navigate(-1)}
        aria-label="뒤로가기"
      >
        <ChevronLeft className="size-[22px]" strokeWidth={2} />
      </button>
      {title && (
        <span className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-gray-900">
          {title}
        </span>
      )}
      <div className={cn("flex items-center gap-0.5", !useRight && "invisible")}>
        <Link to="/stores" className={headerIconButtonClass} aria-label="홈">
          <Home className="size-[22px]" strokeWidth={1.8} />
        </Link>
        <CartIcon />
      </div>
    </div>
  );
}
