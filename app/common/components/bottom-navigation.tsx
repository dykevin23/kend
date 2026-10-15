import { Heart, House, TrendingUp, UserRound, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router";
import { cn } from "~/lib/utils";

const NAVI_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/stores", label: "스토어", icon: House },
  { to: "/children", label: "성장기록", icon: TrendingUp },
  { to: "/likes", label: "좋아요", icon: Heart },
  { to: "/myPage", label: "마이페이지", icon: UserRound },
];

export default function BottomNavigation() {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0",
        "flex w-full px-2 pt-2 items-start",
        "border-t border-gray-200 bg-white",
        "pb-[max(0.625rem,var(--safe-area-inset-bottom))]",
        "z-50"
      )}
    >
      {NAVI_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} prefetch="intent" className="flex-1">
          {({ isActive }) => (
            <div
              className={cn(
                "flex flex-col items-center gap-[3px]",
                isActive ? "text-primary" : "text-gray-400"
              )}
            >
              <Icon className="size-6" strokeWidth={1.8} />
              <span className="text-[11px] font-bold">{label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
