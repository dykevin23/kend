import {
  boolean,
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

// ============================================================
// Enum 정의
// ============================================================

/**
 * 자녀 성별
 * - boy: 남자아이
 * - girl: 여자아이
 */
export const childGender = pgEnum("child_gender", ["boy", "girl"]);

// ============================================================
// 테이블 정의
// ============================================================

/**
 * 자녀(children) 테이블
 *
 * 사용자가 등록한 자녀 정보
 *
 * id                  자녀 ID (PK)
 * user_id             사용자 ID (FK → profiles)
 * code                자녀 코드 (URL용, 사용자별 순번 1,2,3...)
 * nickname            닉네임 (필수, 앱 내 표시용)
 * name                이름 (선택, 실제 이름)
 * gender              성별 (boy/girl)
 * birth_date          생년월일
 * profile_image_url   프로필 이미지 URL
 * created_at          생성일시
 * updated_at          수정일시
 */
export const children = pgTable(
  "children",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .notNull()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    code: integer().notNull(),
    nickname: text().notNull(),
    name: text(),
    gender: childGender(),
    birth_date: date().notNull(),
    profile_image_url: text(),
    is_dummy: boolean().notNull().default(false),
    created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("children_user_code_unique").on(table.user_id, table.code)]
);

/**
 * 성장 기록(growth_records) 테이블
 *
 * 자녀의 신체 측정 기록
 * 각 측정값은 nullable - 일부만 입력 가능
 *
 * id                  성장 기록 ID (PK)
 * child_id            자녀 ID (FK → children)
 * measured_at         측정일
 * height              신장 (cm)
 * weight              체중 (kg)
 * foot_size           발사이즈 (mm)
 * head_circumference  머리둘레 (cm)
 * created_at          생성일시
 * updated_at          수정일시
 */
export const growthRecords = pgTable("growth_records", {
  id: uuid().primaryKey().defaultRandom(),
  child_id: uuid()
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  measured_at: date().notNull(),
  height: decimal({ precision: 5, scale: 2 }), // 최대 999.99 cm
  weight: decimal({ precision: 5, scale: 2 }), // 최대 999.99 kg
  foot_size: decimal({ precision: 5, scale: 1 }), // 최대 9999.9 mm
  head_circumference: decimal({ precision: 5, scale: 2 }), // 최대 999.99 cm
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
