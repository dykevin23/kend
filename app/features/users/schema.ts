import {
  boolean,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const users = pgSchema("auth").table("users", {
  id: uuid().primaryKey(),
});

export const roles = pgEnum("role", ["customer", "seller", "administrator"]);

/**
 * 사용자(profiles) 테이블
 * profile_id       사용자ID(key)
 * nickname         닉네임
 * username         이름
 * phone            전화번호
 * avatar           아바타url
 * introduction     한줄소개
 * comment          기타 메세지
 * created_at       등록일시
 * updated_at       수정일시
 * stats            followers(팔로워수), following(팔로잉수)
 */
export const profiles = pgTable("profiles", {
  profile_id: uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  nickname: text().notNull(),
  username: text().notNull(),
  phone: text(),
  avatar: text(),
  introduction: text(),
  comment: text(),
  role: roles().default("customer").notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  stats: jsonb().$type<{
    followers: number;
    following: number;
  }>(),
});

/**
 * 팔로우(follows) 테이블
 * follower_id      팔로우 사용자 ID(팔로우 하는 사람)
 * following_id     팔로잉 사용자 ID(팔로우 당하는 사람)
 */
export const follows = pgTable("follows", {
  follower_id: uuid().references(() => profiles.profile_id, {
    onDelete: "cascade",
  }),
  following_id: uuid().references(() => profiles.profile_id, {
    onDelete: "cascade",
  }),
  created_at: timestamp().notNull().defaultNow(),
});

/**
 * 사용자 배송지(user_addresses) 테이블
 * id               배송지 ID
 * user_id          사용자 ID
 * label            배송지명 (집, 회사 등)
 * recipient_name   수령인 이름
 * recipient_phone  수령인 휴대폰번호
 * zone_code        우편번호
 * address          기본 주소
 * address_detail   상세 주소
 * is_default       기본 배송지 여부
 * created_at       등록일시
 * updated_at       수정일시
 */
export const userAddresses = pgTable("user_addresses", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid()
    .notNull()
    .references(() => profiles.profile_id, { onDelete: "cascade" }),
  label: text().notNull(),
  recipient_name: text().notNull(),
  recipient_phone: text().notNull(),
  zone_code: text().notNull(),
  address: text().notNull(),
  address_detail: text(),
  is_default: boolean().notNull().default(false),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
