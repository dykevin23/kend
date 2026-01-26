import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

// products 테이블 참조 (외부 테이블)
const products = pgTable("products", {
  id: uuid().primaryKey(),
});

/**
 * 좋아요(product_likes) 테이블
 * user_id      사용자 ID (FK → profiles.profile_id)
 * product_id   상품 ID (FK → products.id)
 * created_at   좋아요 시점
 *
 * PK: user_id + product_id 복합키 (한 상품당 한 번만 좋아요)
 */
export const productLikes = pgTable(
  "product_likes",
  {
    user_id: uuid()
      .notNull()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    product_id: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    created_at: timestamp().notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.user_id, table.product_id] })]
);
