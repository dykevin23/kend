import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

// ============================================================
// 외부 테이블 참조 (KEND-SELLER에서 관리하는 테이블)
// ============================================================

const products = pgTable("products", {
  id: uuid().primaryKey(),
});

const productStockKeepings = pgTable("product_stock_keepings", {
  id: uuid().primaryKey(),
});

// ============================================================
// Enum 정의
// ============================================================

/**
 * 주문 그룹 상태 (결제 단위)
 * - pending: 결제 대기
 * - paid: 결제 완료
 * - partially_refunded: 부분 환불
 * - refunded: 전액 환불
 * - cancelled: 취소
 */
export const orderGroupStatus = pgEnum("order_group_status", [
  "pending",
  "paid",
  "partially_refunded",
  "refunded",
  "cancelled",
]);

/**
 * 주문 상태 (판매자별)
 * - pending: 주문 접수
 * - confirmed: 주문 확인 (판매자)
 * - preparing: 상품 준비중
 * - shipped: 발송 완료
 * - delivered: 배송 완료
 * - cancelled: 취소
 */
export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
]);

/**
 * 배송 상태
 * - pending: 배송 대기
 * - preparing: 상품 준비중
 * - shipped: 발송됨
 * - in_transit: 배송중
 * - delivered: 배송 완료
 */
export const deliveryStatus = pgEnum("delivery_status", [
  "pending",
  "preparing",
  "shipped",
  "in_transit",
  "delivered",
]);

/**
 * 배송 아이템 상태
 * - normal: 정상
 * - cancelled: 취소됨
 * - return_requested: 반품 요청
 * - returned: 반품 완료
 * - exchange_requested: 교환 요청
 * - exchanged: 교환 완료
 */
export const deliveryItemStatus = pgEnum("delivery_item_status", [
  "normal",
  "cancelled",
  "return_requested",
  "returned",
  "exchange_requested",
  "exchanged",
]);

/**
 * 배송비 타입
 * - FREE: 무료배송
 * - PAID: 유료 (선결제)
 * - COD: 착불
 * - CONDITIONAL: 조건부 무료
 */
export const shippingFeeType = pgEnum("shipping_fee_type", [
  "FREE",
  "PAID",
  "COD",
  "CONDITIONAL",
]);

// ============================================================
// 테이블 정의
// ============================================================

/**
 * 주문 그룹(order_groups) 테이블 - 결제/체크아웃 단위
 *
 * 사용자 기준 "한 번의 결제" 단위
 * 여러 판매자의 주문(orders)을 포함할 수 있음
 *
 * id                      주문 그룹 ID (PK)
 * user_id                 사용자 ID (FK → profiles)
 * order_number            주문번호 (고객용, 예: ORD-20250128-A1B2C)
 * status                  상태
 * total_product_amount    상품 금액 합계
 * total_shipping_fee      배송비 합계
 * total_discount_amount   할인 금액 (쿠폰 등, TBD)
 * total_amount            최종 결제 금액
 * recipient_name          수령인 이름 (스냅샷)
 * recipient_phone         수령인 휴대폰 (스냅샷)
 * zone_code               우편번호 (스냅샷)
 * address                 기본 주소 (스냅샷)
 * address_detail          상세 주소 (스냅샷)
 * payment_method          결제 수단 (TBD)
 * paid_at                 결제 완료 시각 (TBD)
 * created_at              생성일시
 * updated_at              수정일시
 */
export const orderGroups = pgTable("order_groups", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid()
    .notNull()
    .references(() => profiles.profile_id, { onDelete: "cascade" }),
  order_number: text().notNull().unique(),
  status: orderGroupStatus().notNull().default("pending"),

  // 금액
  total_product_amount: integer().notNull(),
  total_shipping_fee: integer().notNull(),
  total_discount_amount: integer().notNull().default(0),
  total_amount: integer().notNull(),

  // 배송지 스냅샷
  recipient_name: text().notNull(),
  recipient_phone: text().notNull(),
  zone_code: text().notNull(),
  address: text().notNull(),
  address_detail: text(),

  // 결제 정보 (TBD)
  payment_method: text(),
  paid_at: timestamp({ withTimezone: true }),

  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/**
 * 주문(orders) 테이블 - 판매자별 주문 단위
 *
 * 판매자 기준 주문 단위, order_group 하위
 *
 * id                주문 ID (PK)
 * order_group_id    주문 그룹 ID (FK → order_groups)
 * seller_id         판매자 ID (FK → profiles)
 * order_number      주문번호 (판매자용, 예: ORD-20250128-A1B2C-01)
 * status            상태
 * product_amount    상품 금액 합계
 * shipping_fee      배송비
 * total_amount      합계
 * seller_name       판매자명 (스냅샷)
 * seller_code       판매자 코드 (스냅샷)
 * created_at        생성일시
 * updated_at        수정일시
 */
export const orders = pgTable("orders", {
  id: uuid().primaryKey().defaultRandom(),
  order_group_id: uuid()
    .notNull()
    .references(() => orderGroups.id, { onDelete: "cascade" }),
  seller_id: uuid()
    .notNull()
    .references(() => profiles.profile_id),

  order_number: text().notNull().unique(),
  status: orderStatus().notNull().default("pending"),

  // 금액
  product_amount: integer().notNull(),
  shipping_fee: integer().notNull(),
  total_amount: integer().notNull(),

  // 판매자 스냅샷
  seller_name: text().notNull(),
  seller_code: text().notNull(),

  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/**
 * 주문 상품(order_items) 테이블
 *
 * 주문 내 개별 상품, 스냅샷 저장
 *
 * id                            주문 상품 ID (PK)
 * order_id                      주문 ID (FK → orders)
 * sku_id                        SKU ID (FK, nullable - 삭제되어도 주문 데이터 유지)
 * product_id                    상품 ID (FK, nullable - 삭제되어도 주문 데이터 유지)
 * product_name                  상품명 (스냅샷)
 * product_code                  상품 코드 (스냅샷)
 * sku_code                      SKU 코드 (스냅샷)
 * options                       옵션 (스냅샷, 예: {"색상": "검정", "사이즈": "M"})
 * main_image                    대표 이미지 (스냅샷)
 * regular_price                 정가 (스냅샷)
 * sale_price                    판매가 (스냅샷)
 * quantity                      수량
 * subtotal                      소계 (sale_price * quantity)
 * shipping_fee_type             배송비 타입 (스냅샷)
 * base_shipping_fee             기본 배송비 (스냅샷)
 * free_shipping_condition_value 무료배송 조건 금액 (스냅샷)
 * ship_from_region              출고 지역 (스냅샷)
 * created_at                    생성일시
 */
export const orderItems = pgTable("order_items", {
  id: uuid().primaryKey().defaultRandom(),
  order_id: uuid()
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  // 원본 참조 (히스토리용)
  sku_id: uuid().references(() => productStockKeepings.id, {
    onDelete: "set null",
  }),
  product_id: uuid().references(() => products.id, { onDelete: "set null" }),

  // 상품 스냅샷
  product_name: text().notNull(),
  product_code: text().notNull(),
  sku_code: text().notNull(),
  options: jsonb().$type<Record<string, string> | null>(),
  main_image: text(),

  // 가격 스냅샷
  regular_price: integer().notNull(),
  sale_price: integer().notNull(),
  quantity: integer().notNull(),
  subtotal: integer().notNull(),

  // 배송 정책 스냅샷
  shipping_fee_type: shippingFeeType().notNull(),
  base_shipping_fee: integer().notNull().default(0),
  free_shipping_condition_value: integer(),
  ship_from_region: text(),

  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/**
 * 배송(deliveries) 테이블 - 물류 단위
 *
 * 판매자가 생성/관리하는 배송 단위
 *
 * id               배송 ID (PK)
 * order_id         주문 ID (FK → orders)
 * status           상태
 * courier          택배사
 * tracking_number  송장번호
 * shipping_fee     배송비
 * shipped_at       발송 일시
 * delivered_at     배송 완료 일시
 * created_at       생성일시
 * updated_at       수정일시
 */
export const deliveries = pgTable("deliveries", {
  id: uuid().primaryKey().defaultRandom(),
  order_id: uuid()
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  status: deliveryStatus().notNull().default("pending"),

  // 택배 정보
  courier: text(),
  tracking_number: text(),

  // 배송비
  shipping_fee: integer().notNull().default(0),

  // 배송 일시
  shipped_at: timestamp({ withTimezone: true }),
  delivered_at: timestamp({ withTimezone: true }),

  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/**
 * 배송 상품(delivery_items) 테이블 - 부분취소/교환의 핵심 단위
 *
 * 배송 내 개별 상품
 * 배송이 묶여 있어도 취소/교환/반품은 이 단위로 처리
 *
 * id              배송 상품 ID (PK)
 * delivery_id     배송 ID (FK → deliveries)
 * order_item_id   주문 상품 ID (FK → order_items)
 * quantity        수량 (order_item의 일부만 배송될 수 있음)
 * status          상태 (부분취소/교환 처리용)
 * created_at      생성일시
 * updated_at      수정일시
 */
export const deliveryItems = pgTable("delivery_items", {
  id: uuid().primaryKey().defaultRandom(),
  delivery_id: uuid()
    .notNull()
    .references(() => deliveries.id, { onDelete: "cascade" }),
  order_item_id: uuid()
    .notNull()
    .references(() => orderItems.id, { onDelete: "cascade" }),

  quantity: integer().notNull(),
  status: deliveryItemStatus().notNull().default("normal"),

  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
