import {
  ChartPie,
  CircleUserRound,
  House,
  MessageCircleMore,
} from "lucide-react";
import { NavLink } from "react-router";
import { cn } from "~/lib/utils";

export default function BottomNavigation() {
  return (
    <nav className="flex justify-between w-full h-[56px] items-start self-stretch py-2.5 px-6 fixed bottom-0 border-t-1 bg-white">
      <NavLink to="/products">
        {({ isActive }) => (
          <div className="flex flex-col w-[72px] items-center gap-2">
            <House
              fill={isActive ? "black" : "gray"}
              stroke={isActive ? "black" : "gray"}
            />
            <span
              className={cn([
                "text-xs leading-3",
                isActive ? "text-black" : "text-muted-foreground",
              ])}
            >
              거래하기
            </span>
          </div>
        )}
      </NavLink>
      <NavLink to="/children">
        {({ isActive }) => (
          <div className="flex flex-col w-[72px] items-center gap-2">
            <ChartPie
              fill={isActive ? "black" : "gray"}
              stroke={isActive ? "black" : "gray"}
            />
            <span
              className={cn([
                "text-xs leading-3",
                isActive ? "text-black" : "text-muted-foreground",
              ])}
            >
              데이터
            </span>
          </div>
        )}
      </NavLink>
      <NavLink to="/chats">
        {({ isActive }) => (
          <div className="flex flex-col w-[72px] items-center gap-2">
            <MessageCircleMore
              fill={isActive ? "black" : "gray"}
              stroke={isActive ? "black" : "gray"}
            />
            <span
              className={cn([
                "text-xs leading-3",
                isActive ? "text-black" : "text-muted-foreground",
              ])}
            >
              메세지
            </span>
          </div>
        )}
      </NavLink>
      <NavLink to="/mypage">
        {({ isActive }) => (
          <div className="flex flex-col w-[72px] items-center gap-2">
            <CircleUserRound
              fill={isActive ? "black" : "gray"}
              stroke={isActive ? "black" : "gray"}
            />
            <span
              className={cn([
                "text-xs leading-3",
                isActive ? "text-black" : "text-muted-foreground",
              ])}
            >
              마이페이지
            </span>
          </div>
        )}
      </NavLink>
    </nav>
  );
}
