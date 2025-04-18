import {
  ChartPie,
  CircleUserRound,
  House,
  MessageCircleMore,
} from "lucide-react";
import { Link, useMatches } from "react-router";
import { cn } from "~/lib/utils";

export default function BottomNavigation() {
  return (
    <nav className="flex justify-between w-full h-[56px] items-start self-stretch py-2.5 px-6 fixed bottom-0 border-t-1 bg-white">
      <NaviMenuItem
        url="/products"
        name="거래하기"
        icon={<House className="size-6" />}
      />
      <NaviMenuItem
        url="/children"
        name="데이터"
        icon={<ChartPie className="size-6" />}
      />
      <NaviMenuItem
        url="/chats"
        name="메세지"
        icon={<MessageCircleMore className="size-6" />}
      />
      <NaviMenuItem
        url="/mypage"
        name="마이페이지"
        icon={<CircleUserRound className="size-6" />}
      />
    </nav>
  );
}

interface NaviMenuItemProps {
  url: string;
  name: string;
  icon: React.ReactNode;
}
const NaviMenuItem = ({ url, name, icon }: NaviMenuItemProps) => {
  const [_, ...matches] = useMatches();
  const { pathname } = matches[0];

  return (
    <Link to={url}>
      <div className="flex flex-col w-[72px] items-center gap-2">
        {icon}
        <span
          className={cn([
            "text-xs leading-3",
            url === pathname && "text-primary",
          ])}
        >
          {name}
        </span>
      </div>
    </Link>
  );
};
