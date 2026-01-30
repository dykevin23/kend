import {
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

// product_stock_keepings 테이블 참조 (외부 테이블)
const productStockKeepings = pgTable("product_stock_keepings", {
  id: uuid().primaryKey(),
});

/**
 * 장바구니(carts) 테이블
 * id          장바구니 ID (PK)
 * user_id     사용자 ID (FK → profiles.profile_id)
 * sku_id      상품 SKU ID (FK → product_stock_keepings.id)
 * quantity    수량
 * created_at  담은 시점
 * updated_at  수정 시점
 *
 * 제약조건: user_id + sku_id 조합 유니크 (같은 SKU는 수량만 증가)
 */
export const carts = pgTable(
  "carts",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .notNull()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    sku_id: uuid()
      .notNull()
      .references(() => productStockKeepings.id, { onDelete: "cascade" }),
    quantity: integer().notNull().default(1),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (table) => [unique("carts_user_sku_unique").on(table.user_id, table.sku_id)]
);
