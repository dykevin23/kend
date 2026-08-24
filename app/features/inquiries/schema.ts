import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";
import { orderItems } from "../orders/schema";

/**
 * 문의 카테고리
 * - DELIVERY: 배송
 * - PRODUCT: 상품 (구매확정 후 AS 문의 포함)
 * - PAYMENT: 결제/환불
 * - ETC: 기타
 */
export const inquiryCategory = pgEnum("inquiry_category", [
  "DELIVERY",
  "PRODUCT",
  "PAYMENT",
  "ETC",
]);

/**
 * 문의 상태
 * - pending: 답변대기
 * - answered: 답변완료
 */
export const inquiryStatus = pgEnum("inquiry_status", ["pending", "answered"]);

/**
 * 문의(inquiries) 테이블 (P2.5-4)
 *
 * 반품/교환처럼 상태전이 액션이 아니라 순수 Q&A — 단일 질문 + 단일 답변 구조로,
 * 스레드형 대화는 지원하지 않는다. order_item_id는 선택적 연결(특정 상품 관련
 * 문의일 때만 채움) — order_group_id가 아니라 order_item_id인 이유: order_group은
 * 여러 판매자 주문을 포함할 수 있어 "이 문의가 어느 판매자 몫인지" 특정이 안 되지만,
 * order_item은 orders.seller_id로 바로 이어져 판매자가 항상 유일하게 정해진다.
 * 답변(answer)은 kend-seller의 처리화면에서 채워진다.
 *
 * id              문의 ID (PK)
 * user_id         작성자 (FK → profiles)
 * order_item_id   연결된 상품 (FK → order_items, nullable)
 * category        문의 카테고리
 * title           제목
 * content         문의 내용
 * status          답변대기/답변완료
 * answer          답변 내용 (kend-seller에서 작성)
 * answered_at     답변 시각
 * created_at      생성일시
 * updated_at      수정일시
 */
export const inquiries = pgTable("inquiries", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid()
    .notNull()
    .references(() => profiles.profile_id, { onDelete: "cascade" }),
  order_item_id: uuid().references(() => orderItems.id, {
    onDelete: "set null",
  }),

  category: inquiryCategory().notNull(),
  title: text().notNull(),
  content: text().notNull(),
  status: inquiryStatus().notNull().default("pending"),
  answer: text(),
  answered_at: timestamp({ withTimezone: true }),

  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
