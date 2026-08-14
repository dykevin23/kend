import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * 상태 이력(entity_status_history) 테이블
 *
 * "원장(현재상태) 테이블 + 이력 테이블" 패턴의 이력 쪽. orders/order_groups/
 * deliveries/delivery_items/payments 등 상태를 갖는 모든 엔티티가 공용으로 쓸 수 있도록
 * entity_type으로 구분한다 (엔티티마다 별도 이력 테이블을 새로 만들지 않기 위함).
 *
 * DB 트리거가 원장 테이블 UPDATE 시점에 자동으로 채운다 — 앱 코드가 매 변경 지점마다
 * "이것도 로그로 남겨야지"를 기억할 필요가 없고, 어떤 경로(kend/kend-seller/크론)로
 * 바뀌었든 빠짐없이 잡힌다.
 *
 * status만으로 표현 안 되는 세부 변화(같은 status 안에서 승인/거절 등)는 snapshot에
 * 그 순간의 관련 컬럼들을 통째로 담아 보완한다.
 *
 * 현재는 delivery_items(반품)에만 트리거가 연결되어 있다 (app/sql/triggers/
 * on_delivery_item_status_changed.sql). orders/order_groups/deliveries/payments로
 * 확장할지는 별도 작업으로 판단한다.
 *
 * id           이력 ID (PK)
 * entity_type  엔티티 종류 (예: 'delivery_item') — FK 아님, 여러 테이블을 가리키는 폴리모픽 참조
 * entity_id    해당 엔티티의 row id
 * status       그 시점의 상태값 (엔티티의 status 컬럼 값을 그대로 미러링)
 * snapshot     그 시점의 관련 컬럼 스냅샷 (jsonb, 엔티티마다 다른 필드를 담음)
 * occurred_at  이 상태가 된 시각
 */
export const entityStatusHistory = pgTable(
  "entity_status_history",
  {
    id: uuid().primaryKey().defaultRandom(),
    entity_type: text().notNull(),
    entity_id: uuid().notNull(),
    status: text().notNull(),
    snapshot: jsonb().$type<Record<string, unknown> | null>(),
    occurred_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("entity_status_history_entity_idx").on(table.entity_type, table.entity_id)]
);
