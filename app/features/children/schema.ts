import {
  bigint,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

/**
 * 성별
 * male, female
 */
export const genderType = pgEnum("gender_type", ["male", "female"]);

/**
 * 자녀(children) 테이블
 * child_id         자녀ID(key)
 * name             자녀이름
 * nickname         자녀 닉네임
 * birthday         생년월일
 * gender           성별
 * parent_id        부모ID
 * created_at       등록일시
 * updated_at       수정일시
 */
export const children = pgTable("children", {
  child_id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: text(),
  nickname: text().notNull(),
  birthday: text().notNull(),
  gender: genderType().notNull(),
  parent_id: uuid().references(() => profiles.profile_id, {
    onDelete: "cascade",
  }),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

/**
 * 자녀성장데이터(childGrowth) 테이블
 * growth_id            성장데이터ID(key)
 * child_id             자녀ID
 * height               신장
 * weight               몸무게
 * head_circumference   머리둘레
 * recorded_at          기록날짜(YYYYMMDD)
 * created_at           등록일시
 * updated_at           수정일시
 */
export const childGrowth = pgTable("child_growth", {
  growth_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  child_id: bigint({ mode: "number" }).references(() => children.child_id, {
    onDelete: "cascade",
  }),
  height: numeric("height", { precision: 4, scale: 1 }),
  weight: numeric("weight", { precision: 4, scale: 1 }),
  head_circumference: numeric("head_circumference", { precision: 3, scale: 1 }),
  recorded_at: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
