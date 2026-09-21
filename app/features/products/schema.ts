import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

// products 테이블 참조 (외부 테이블)
const products = pgTable("products", {
  id: uuid().primaryKey(),
});

/**
 * 최근 본 상품(product_views) 테이블
 * user_id      사용자 ID (FK → profiles.profile_id)
 * product_id   상품 ID (FK → products.id)
 * viewed_at    마지막으로 조회한 시점 (조회할 때마다 upsert로 갱신 — 매 조회를 남기는
 *              로그가 아니라 product_likes/store_likes와 동일하게 user_id+product_id당
 *              1row만 유지한다)
 *
 * PK: user_id + product_id 복합키
 */
export const productViews = pgTable(
  "product_views",
  {
    user_id: uuid()
      .notNull()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    product_id: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    viewed_at: timestamp().notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.user_id, table.product_id] })]
);
