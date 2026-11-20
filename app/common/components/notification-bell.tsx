import { Bell } from "lucide-react";
import { Link, useRouteLoaderData } from "react-router";
import { cn } from "~/lib/utils";

interface RootLoaderData {
  unreadNotificationCount?: number;
}

/** 알림함 진입 버튼 — 안 읽은 알림이 있으면 점 표시 */
export default function NotificationBell({ className }: { className?: string }) {
  const data = useRouteLoaderData("root") as RootLoaderData | undefined;
  const hasUnread = (data?.unreadNotificationCount ?? 0) > 0;

  return (
    <Link
      to="/notifications"
      aria-label={hasUnread ? "알림 (안 읽은 알림 있음)" : "알림"}
      className={cn(
        "relative flex size-[38px] items-center justify-center text-gray-900",
        className
      )}
    >
      <Bell className="size-[22px]" strokeWidth={1.8} />
      {hasUnread && (
        <span className="absolute top-[8px] right-[9px] size-[7px] rounded-full bg-accent ring-2 ring-white" />
      )}
    </Link>
  );
}
