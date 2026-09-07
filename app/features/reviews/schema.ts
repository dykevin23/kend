import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

// products 테이블 참조 (외부 테이블)
const products = pgTable("products", {
  id: uuid().primaryKey(),
});

// delivery_items 테이블 참조 (외부 테이블, orders/schema.ts 소유)
const deliveryItems = pgTable("delivery_items", {
  id: uuid().primaryKey(),
});

/**
 * 리뷰(reviews) 테이블
 *
 * 정책(2026-09-03 확정 — 최초 "상품당 1개"에서 변경):
 * - 구매확정(delivery_items.purchase_confirmed_at)한 건에 대해서만 작성 가능
 * - 구매확정 건(delivery_item)당 1개 — 같은 상품을 재구매해서 다시 구매확정하면
 *   또 리뷰 작성 가능(재구매 시점의 경험이 다를 수 있어 매 구매 건마다 허용하는 게
 *   일반적인 이커머스 관행과도 맞음). unique는 delivery_item_id 하나로 충분
 *   (delivery_item은 이미 특정 사용자에게 귀속되므로 user_id 복합 불필요)
 * - 별점 + 텍스트만 (색감/사이즈/두께감 등 세부 만족도는 이번 스코프 아님)
 *
 * user_id            작성자 (FK → profiles.profile_id)
 * product_id         리뷰 대상 상품 (FK → products.id) — 상품 단위 집계·조회용 비정규화
 * delivery_item_id   리뷰 대상 구매 건 (FK → delivery_items.id) — 중복 작성 방지 기준
 * rating             별점 1~5 (앱 레벨에서 범위 검증)
 * content            리뷰 내용
 * created_at         작성일시
 * seller_reply       판매자 답변 (kend-seller 리뷰관리 화면, 2026-09-04 추가) — 없으면 미답변
 * seller_replied_at  답변 작성일시 — NULL이면 미답변 (kend-seller "미답변" 필터 기준)
 */
export const reviews = pgTable(
  "reviews",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .notNull()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    product_id: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    delivery_item_id: uuid()
      .notNull()
      .references(() => deliveryItems.id, { onDelete: "cascade" }),
    rating: integer().notNull(),
    content: text().notNull(),
    created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
    seller_reply: text(),
    seller_replied_at: timestamp({ withTimezone: true }),
  },
  (table) => [
    unique("reviews_delivery_item_id_unique").on(table.delivery_item_id),
  ]
);

/**
 * 리뷰 첨부 이미지(review_images) — product_images와 동일한 분리 테이블 패턴
 * 스토리지 경로: reviews 버킷 / {userId}/{deliveryItemId}/{randomId}.{ext}
 * (profiles 버킷의 "폴더 첫 세그먼트 = auth.uid()" 소유권 검증 패턴과 동일)
 */
export const reviewImages = pgTable("review_images", {
  id: uuid().primaryKey().defaultRandom(),
  review_id: uuid()
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  url: text().notNull(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
