import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid } from "drizzle-orm/supabase";
import { profiles } from "../users/schema";

/**
 * 앱 푸시 알림 (readme/active/push-notification-plan.md)
 *
 * 흐름: 상태 변경(kend·seller·크론) → DB 트리거가 notifications insert
 *       → pg_net으로 Edge Function send-push 호출 → Expo Push API → 기기
 * 트리거·발송 함수는 app/sql/triggers/notifications.sql (Drizzle가 함수·트리거를 표현 못 해 별도 SQL).
 *
 * 세 테이블 모두 처음부터 RLS — 본인 행만. 발송(Edge Function)은 secret 키라 RLS를 우회한다.
 */

/**
 * 기기 푸시 토큰 (Expo push token)
 * - 한 기기 = 한 토큰. 같은 기기에서 다른 계정으로 로그인하면 register_push_token RPC가 소유자를 옮긴다
 *   (RLS상 남의 행을 고칠 수 없어 RPC로 처리)
 * - DeviceNotRegistered(앱 삭제 등) 응답을 받으면 send-push가 삭제
 */
export const pushTokens = pgTable(
  "push_tokens",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .notNull()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    token: text().notNull().unique(),
    platform: text().notNull(), // ios | android
    created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
    last_seen_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("push_tokens_user_idx").on(t.user_id),
    pgPolicy("push_tokens_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.user_id} = ${authUid}`,
    }),
    pgPolicy("push_tokens_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${t.user_id} = ${authUid}`,
    }),
  ]
);

/**
 * 알림 수신 설정 — 행이 없으면 기본값(주문·문의 켜짐)으로 본다.
 * marketing은 2차(광고성 수신 동의 기록과 함께) — 지금은 화면에 노출하지 않는다.
 */
export const notificationSettings = pgTable(
  "notification_settings",
  {
    user_id: uuid()
      .primaryKey()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    order_updates: boolean().notNull().default(true),
    inquiry_updates: boolean().notNull().default(true),
    marketing: boolean().notNull().default(false),
    updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    pgPolicy("notification_settings_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.user_id} = ${authUid}`,
    }),
    pgPolicy("notification_settings_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${t.user_id} = ${authUid}`,
    }),
    pgPolicy("notification_settings_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.user_id} = ${authUid}`,
      withCheck: sql`${t.user_id} = ${authUid}`,
    }),
  ]
);

/**
 * 알림 종류
 * - order_paid: 주문(결제) 완료
 * - order_shipped: 상품 발송 (판매자 송장 등록)
 * - order_delivered: 배송 완료 (배송추적 크론)
 * - order_cancelled: 결제 완료 후 주문 취소 (구매자 취소·판매자 미확인 자동취소)
 * - order_refunded: 환불 완료 (반품 환불 — 전체/일부)
 * - return_approved: 반품 승인 (판매자)
 * - inquiry_answered: 문의 답변 등록 (판매자)
 */
export const notificationType = pgEnum("notification_type", [
  "order_paid",
  "order_shipped",
  "order_delivered",
  "order_cancelled",
  "order_refunded",
  "return_approved",
  "inquiry_answered",
]);

/**
 * 푸시 발송 상태 (알림함 노출과는 무관 — 알림함은 상태와 상관없이 전부 보여준다)
 * - pending: 발송 대기 / sending: send-push가 가져가 처리 중
 * - sent: 1개 이상 기기에 전달 / failed: 재시도(3회) 소진
 * - skipped: 사용자가 해당 알림을 꺼둠 / no_device: 등록된 기기 없음
 */
export const pushStatus = pgEnum("push_status", [
  "pending",
  "sending",
  "sent",
  "failed",
  "skipped",
  "no_device",
]);

/**
 * 알림 — 푸시 발송 대기열 겸 앱 내 알림함.
 * 본문엔 이름·주소·전화번호 등 개인정보를 넣지 않는다 (잠금화면 노출).
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .notNull()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    type: notificationType().notNull(),
    title: text().notNull(),
    body: text().notNull(),
    url: text(), // 탭하면 이동할 앱 내 경로 (예: /orders/{order_group_id})
    push_status: pushStatus().notNull().default("pending"),
    attempts: integer().notNull().default(0),
    claimed_at: timestamp({ withTimezone: true }), // send-push가 가져간 시각 (멈춤 판단 기준)
    error: text(),
    created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
    sent_at: timestamp({ withTimezone: true }),
    read_at: timestamp({ withTimezone: true }),
  },
  (t) => [
    index("notifications_user_created_idx").on(t.user_id, t.created_at.desc()),
    index("notifications_pending_idx")
      .on(t.created_at)
      .where(sql`${t.push_status} in ('pending', 'sending')`),
    pgPolicy("notifications_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.user_id} = ${authUid}`,
    }),
    // 읽음 처리(read_at)용. 다른 컬럼을 바꿔도 본인 알림이라 영향 없음
    pgPolicy("notifications_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.user_id} = ${authUid}`,
      withCheck: sql`${t.user_id} = ${authUid}`,
    }),
  ]
);
