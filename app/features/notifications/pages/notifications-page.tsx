import { Link, redirect, useFetcher, useLoaderData, useNavigate } from "react-router";
import { DateTime } from "luxon";
import {
  Bell,
  MessageCircle,
  Package,
  RotateCcw,
  Settings,
  Truck,
  XCircle,
} from "lucide-react";
import Content from "~/common/components/content";
import { cn } from "~/lib/utils";
import { browserClient, makeSSRClient } from "~/supa-client";
import { actionErrorResponse } from "~/lib/error-handler";
import {
  getUserNotifications,
  NOTIFICATION_RETENTION_DAYS,
  type UserNotification,
} from "../queries";
import { markAllNotificationsRead } from "../mutations";
import type { Route } from "./+types/notifications-page";

export const meta = () => [{ title: "알림 | KEND" }];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw redirect("/auth/login");

  const notifications = await getUserNotifications(client, user.id);
  return { notifications };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: "로그인이 필요합니다." };

  const formData = await request.formData();
  if (formData.get("intent") === "readAll") {
    try {
      await markAllNotificationsRead(client, user.id);
      return { success: true };
    } catch (error) {
      return actionErrorResponse(error);
    }
  }
  return { success: false, error: "잘못된 요청입니다." };
};

const TYPE_ICON: Record<UserNotification["type"], typeof Bell> = {
  order_paid: Package,
  order_shipped: Truck,
  order_delivered: Truck,
  order_cancelled: XCircle,
  order_refunded: RotateCcw,
  return_approved: RotateCcw,
  inquiry_answered: MessageCircle,
};

const formatTime = (iso: string) => {
  const dt = DateTime.fromISO(iso);
  // 일주일 이내는 "3시간 전", 그 이후는 날짜
  return DateTime.now().diff(dt, "days").days < 7
    ? (dt.toRelative({ locale: "ko" }) ?? "")
    : dt.toFormat("yyyy.M.d");
};

export default function NotificationsPage() {
  const { notifications } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const hasUnread = notifications.some((n) => !n.isRead);

  const handleOpen = async (n: UserNotification) => {
    if (!n.isRead) {
      // 읽음 처리 후 이동 — RLS로 본인 알림만 수정 가능. 실패해도 이동은 한다
      try {
        await browserClient
          .from("notifications")
          .update({ read_at: new Date().toISOString() })
          .eq("id", n.id);
      } catch {
        /* 무시 */
      }
    }
    if (n.url) navigate(n.url);
    else navigate(".", { replace: true });
  };

  return (
    <Content headerPorps={{ title: "알림", useRight: false }}>
      <div className="flex flex-col w-full min-h-full bg-gray-50">
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="readAll" />
            <button
              type="submit"
              disabled={!hasUnread || fetcher.state !== "idle"}
              className="text-xs font-medium text-gray-700 disabled:text-gray-300"
            >
              모두 읽음
            </button>
          </fetcher.Form>
          <Link
            to="/myPage/notifications"
            className="flex items-center gap-1 text-xs text-gray-500"
          >
            <Settings className="size-3.5" />
            알림 설정
          </Link>
        </div>

        {notifications.length > 0 ? (
          <ul className="flex flex-col">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleOpen(n)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-4 text-left border-b border-gray-100",
                      n.isRead ? "bg-white" : "bg-primary/5"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        n.isRead ? "bg-gray-100 text-gray-400" : "bg-primary/10 text-primary"
                      )}
                    >
                      <Icon className="size-[18px]" strokeWidth={1.8} />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-sm truncate",
                            n.isRead ? "font-medium text-gray-600" : "font-bold text-gray-900"
                          )}
                        >
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-label="안 읽음" />
                        )}
                      </div>
                      <span className="text-[13px] leading-5 text-gray-500 line-clamp-2">
                        {n.body}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
            <Bell className="size-8 text-gray-300" strokeWidth={1.5} />
            <span className="text-sm text-gray-500">받은 알림이 없어요</span>
            <span className="text-xs text-gray-400">
              주문·배송·문의 답변 소식을 여기에서 볼 수 있어요
            </span>
          </div>
        )}

        {notifications.length > 0 && (
          <p className="px-4 py-4 text-[11px] text-gray-400 text-center">
            최근 {NOTIFICATION_RETENTION_DAYS}일 동안의 알림을 보여드려요
          </p>
        )}
      </div>
    </Content>
  );
}
