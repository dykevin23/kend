import { pgSchema, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const users = pgSchema("auth").table("users", {
  id: uuid().primaryKey(),
});

/**
 * 사용자(profiles) 테이블
 * profile_id       사용자ID(key)
 * nickname         닉네임
 * username         이름
 * avatar           아바타url
 * introduction     한줄소개
 * comment          기타 메세지
 * created_at       등록일시
 * updated_at       수정일시
 */
export const profiles = pgTable("profiles", {
  profile_id: uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  nickname: text().notNull(),
  username: text().notNull(),
  avatar: text(),
  introduction: text(),
  comment: text(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

/**
 * 팔로우(follows) 테이블
 * follower_id      팔로우 사용자 ID(팔로우 당한 사람, 본인이 팔로우한)
 * following_id     팔로잉 사용자 ID(팔로우 한 사람, 본인)
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
