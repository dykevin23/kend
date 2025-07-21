import {
  bigint,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

/**
 * 상품 상태(판매)
 * sales(판매중), done(판매완료)
 */
export const productStatusType = pgEnum("product_status_type", [
  "sales",
  "done",
]);

/**
 * 상품(products) 테이블
 * product_id       상품ID(key)
 * name             상품명
 * price            판매가격
 * description      상품설명
 * deal_location    직거래 희망 장소
 * status           상품 상태(판매)
 * profile_id       판매자(등록자)ID
 * created_at       등록일시
 * updated_at       수정일시
 * stats            views: 조회수, chats: 채팅수, likes: 좋아요수
 */
export const products = pgTable("products", {
  product_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  name: text().notNull(),
  price: integer().notNull(),
  description: text().notNull(),
  deal_location: text().notNull(),
  status: productStatusType().notNull().default("sales"),
  profile_id: uuid()
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  stats: jsonb().notNull().default({ views: 0, chats: 0, likes: 0 }),
});

/**
 * 상품 이미지(productImages) 테이블
 * image_id         이미지ID(key)
 * image            이미지
 * product_id       상품ID
 * created_at       등록일시
 */
export const productImages = pgTable("product_images", {
  image_id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  image: text().notNull(),
  product_id: bigint({ mode: "number" })
    .references(() => products.product_id, { onDelete: "cascade" })
    .notNull(),
  created_at: timestamp().notNull().defaultNow(),
});

/**
 * 상품 해시태그(productHashtags) 테이블
 * hashtag_id       해시태그ID(key)
 * hashtag          해시태그
 * product_id       상품ID
 * created_at       등록일시
 */
export const productHashtags = pgTable("product_hashtags", {
  hashtag_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  hashtag: text().notNull(),
  product_id: bigint({ mode: "number" })
    .references(() => products.product_id, { onDelete: "cascade" })
    .notNull(),
  created_at: timestamp().notNull().defaultNow(),
});

/**
 * 상품 조회수(productViews) 테이블
 * product_id       상품ID
 * profile_id       사용자ID
 */
export const productViews = pgTable(
  "product_views",
  {
    product_id: bigint({ mode: "number" }).references(
      () => products.product_id,
      { onDelete: "cascade" }
    ),
    profile_id: uuid().references(() => profiles.profile_id, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.product_id, table.profile_id] })]
);

/**
 * 상품 좋아요수(productLikes) 테이블
 * product_id       상품ID
 * profile_id       사용자ID
 */
export const productLikes = pgTable(
  "product_likes",
  {
    product_id: bigint({ mode: "number" }).references(
      () => products.product_id,
      { onDelete: "cascade" }
    ),
    profile_id: uuid().references(() => profiles.profile_id, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.product_id, table.profile_id] })]
);
