import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import type { NotificationPreferences } from "./queries";

type Client = SupabaseClient<Database>;

/** 알림 하나 읽음 처리 (이미 읽은 건은 그대로) */
export const markNotificationRead = async (
  client: Client,
  userId: string,
  notificationId: string
) => {
  const { error } = await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) throw error;
};

/** 안 읽은 알림 전부 읽음 처리 */
export const markAllNotificationsRead = async (client: Client, userId: string) => {
  const { error } = await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) throw error;
};

/** 알림 수신 설정 저장 (행이 없으면 생성) */
export const saveNotificationPreferences = async (
  client: Client,
  userId: string,
  prefs: NotificationPreferences
) => {
  const { error } = await client.from("notification_settings").upsert({
    user_id: userId,
    order_updates: prefs.orderUpdates,
    inquiry_updates: prefs.inquiryUpdates,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
};
