import { NavLink } from "react-router";
import NaviData from "~/assets/icons/navi-data";
import NaviHome from "~/assets/icons/navi-home";
import NaviLike from "~/assets/icons/navi-like";
import NaviMyPage from "~/assets/icons/navi-my-page";
import { cn } from "~/lib/utils";

export default function BottomNavigation() {
  return (
    <nav
      className={cn(
        "flex w-full h-14 py-2.5 px-6 justify-between items-start self-stretch fixed bottom-0",
        "border-t-1 border-t-muted/30 bg-white"
      )}
    >
      <NavLink to="/stores">
        {({ isActive }) => (
          <div className="flex flex-col w-18 items-center gap-1">
            <div className="flex flex-col items-center">
              <NaviHome isActive={isActive} />
            </div>
            <span
              className={cn(
                "text-center text-xs leading-3 tracking-[-0.4px]",
                isActive ? "text-black" : "text-muted"
              )}
            >
              스토어
            </span>
          </div>
        )}
      </NavLink>

      <NavLink to="/children">
        {({ isActive }) => (
          <div className="flex flex-col w-18 items-center gap-1">
            <div className="flex flex-col items-center">
              <NaviData isActive={isActive} />
            </div>
            <span
              className={cn(
                "text-center text-xs leading-3 tracking-[-0.4px]",
                isActive ? "text-black" : "text-muted"
              )}
            >
              성장기록
            </span>
          </div>
        )}
      </NavLink>

      <NavLink to="/like">
        {({ isActive }) => (
          <div className="flex flex-col w-18 items-center gap-1">
            <div className="flex flex-col items-center">
              <NaviLike isActive={isActive} />
            </div>
            <span
              className={cn(
                "text-center text-xs leading-3 tracking-[-0.4px]",
                isActive ? "text-black" : "text-muted"
              )}
            >
              좋아요
            </span>
          </div>
        )}
      </NavLink>

      <NavLink to="/myPage">
        {({ isActive }) => (
          <div className="flex flex-col w-18 items-center gap-1">
            <div className="flex flex-col items-center">
              <NaviMyPage isActive={isActive} />
            </div>
            <span
              className={cn(
                "text-center text-xs leading-3 tracking-[-0.4px]",
                isActive ? "text-black" : "text-muted"
              )}
            >
              마이페이지
            </span>
          </div>
        )}
      </NavLink>
    </nav>
  );
}
