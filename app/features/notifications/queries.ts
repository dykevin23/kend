import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/** 알림함 보관 기간 — 이보다 오래된 알림은 목록에 보이지 않는다 */
export const NOTIFICATION_RETENTION_DAYS = 90;

const retentionStartIso = () =>
  new Date(Date.now() - NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

/** 알림함 목록 (최신순, 최근 90일, 최대 100건). RLS로 본인 알림만 조회된다 */
export const getUserNotifications = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("notifications")
    .select("id, type, title, body, url, created_at, read_at")
    .eq("user_id", userId)
    .gte("created_at", retentionStartIso())
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  return data.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    url: n.url,
    createdAt: n.created_at,
    isRead: !!n.read_at,
  }));
};

export type UserNotification = Awaited<ReturnType<typeof getUserNotifications>>[number];

/** 안 읽은 알림 수 (종 아이콘 표시용) */
export const getUnreadNotificationCount = async (client: Client, userId: string) => {
  const { count, error } = await client
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null)
    .gte("created_at", retentionStartIso());

  if (error) return 0;
  return count ?? 0;
};

export interface NotificationPreferences {
  orderUpdates: boolean;
  inquiryUpdates: boolean;
}

/** 알림 수신 설정 — 행이 없으면 기본값(모두 켜짐) */
export const getNotificationPreferences = async (
  client: Client,
  userId: string
): Promise<NotificationPreferences> => {
  const { data, error } = await client
    .from("notification_settings")
    .select("order_updates, inquiry_updates")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return {
    orderUpdates: data?.order_updates ?? true,
    inquiryUpdates: data?.inquiry_updates ?? true,
  };
};
