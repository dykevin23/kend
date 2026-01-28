# 주문(Order) & 배송(Delivery) 설계 문서 (결제 TBD)

본 문서는 **결제 기능을 아직 확정하지 않은 상태(TBD)**에서,
멀티 셀러 기반 커머스 애플리케이션의 **주문·배송 도메인 설계 방향**과
이에 따른 **테이블 구조, 정책 원칙, 비즈니스 판단 기준**을 정리한 문서이다.

Claude Code(또는 다른 LLM)에게 현재 설계 의도와 방향성을 공유하기 위한 목적을 가진다.

---

## 1. 전체 전제 (Context)

- 플랫폼은 **여러 판매자(Multi-seller)**의 상품을 한 번에 둘러보고 주문할 수 있다.
- 결제는 추후 연동 예정이며, 현재는 **주문·배송 구조를 우선 설계**한다.
- 쿠팡/아마존과 같은 통합 물류 플랫폼이 아니다.
- 판매자별 출고지가 다르며, 배송은 기본적으로 판매자 책임이다.

---

## 2. 핵심 설계 원칙 (매우 중요)

### 2.1 주문과 배송은 분리된 개념이다

- **주문(Order)**: 구매자와 판매자 간의 계약 단위 (비즈니스 상태)
- **배송(Delivery)**: 물류 단위 (묶음, 송장, 택배사 기준)

> 주문은 쪼개지지 않지만, 배송은 얼마든지 쪼개질 수 있다.

### 2.2 상품 개수 ≠ 배송 개수

- 배송은 **상품 개수 기준이 아니라 배송 묶음 정책 결과**로 생성된다.
- 동일 상품 2개라도 배송 정책에 따라 1건 또는 2건의 배송이 될 수 있다.

### 2.3 부분취소 / 교환의 기준은 “배송 내부의 아이템 단위”

- 배송이 묶여 있어도, 그 안의 상품은 각각 독립적으로 취소·교환 가능해야 한다.
- 이를 위해 **delivery_items 테이블이 핵심 역할**을 한다.

---

## 3. 주문 구조 (멀티 셀러 기준)

### 3.1 주문 그룹 (Order Group / Checkout)

> 사용자 기준 “한 번의 결제 시도” 단위

```text
OrderGroup (1)
 ├─ Order (seller A)
 ├─ Order (seller B)
```

- 결제는 향후 `order_group` 단위로 처리될 예정
- 현재는 논리적 그룹 개념만 유지

---

### 3.2 orders (판매자 기준 주문)

```sql
orders
- id (PK)
- order_group_id (nullable, FK)
- seller_id
- buyer_id
- total_amount
- status
- created_at
```

#### 주문 상태 예시
- CREATED
- PAYMENT_PENDING
- PREPARING
- SHIPPED
- COMPLETED
- CANCELLED

---

### 3.3 order_items (주문 상품)

```sql
order_items
- id
- order_id (FK)
- product_id
- product_name_snapshot
- price_snapshot
- quantity
```

- 상품 정보는 **주문 시점 스냅샷**으로 저장

---

## 4. 배송 구조 설계

### 4.1 deliveries (배송 단위)

```sql
deliveries
- id
- order_id (FK)
- status
- courier
- tracking_number
- shipping_fee
- shipping_policy_snapshot
- shipped_at
- delivered_at
- created_at
```

#### 배송 상태 예시
- READY
- PREPARING
- SHIPPED
- DELIVERED

---

### 4.2 delivery_items (배송 내부 상품 단위) ⭐ 핵심

```sql
delivery_items
- id
- delivery_id (FK)
- order_item_id (FK)
- quantity
- status
```

- 배송이 묶여 있어도 **취소/교환/반품은 delivery_item 단위로 처리**
- 배송은 컨테이너, 실질 처리 단위는 delivery_item

---

## 5. 배송 생성 로직 (요약)

1. 주문 생성 시 배송지 스냅샷 확보
2. 판매자 기준으로 주문 분리
3. 주문 내 상품들을 배송 정책에 따라 그룹핑
   - 묶음 가능 여부
   - 출고지
   - 배송 타입 (일반/냉장/냉동 등)
4. 그룹핑 결과만큼 deliveries 생성
5. 각 배송에 delivery_items 연결

---

## 6. 부분취소 / 교환 처리 원칙

### 6.1 부분취소

- 특정 delivery_item만 CANCELLED 처리
- 주문 금액 재계산
- (향후) 결제 연동 시 부분 환불 처리

### 6.2 교환

- 기존 delivery_item → RETURN_REQUESTED
- 교환용 신규 delivery 생성
- 교환 상품을 새로운 delivery_items로 연결

---

## 7. 배송비 & 무료배송 정책 방향

### 7.1 기본 원칙

- 배송비는 **delivery 단위**로 계산된다.
- 무료배송 기준은 **멀티 셀러 환경에서는 판매자 주문(order) 단위**가 기본이다.

### 7.2 무료배송 정책의 성격

> 무료배송은 기술 문제가 아니라 **마케팅/비즈니스 정책**이다.

- 내부 배송 분리로 인한 비용을
  - 사용자에게 전가할지
  - 플랫폼/판매자가 부담할지는 정책 결정 사항

### 7.3 현재 권장 정책 (초기 서비스 기준)

- 무료배송 기준: **판매자 주문 금액 기준**
- 배송비 발생 여부는 판매자별로 명확히 안내
- “주문 기준 무료배송”은 멀티 셀러 환경에서는 사용하지 않음

---

## 8. 고지(문구) 원칙

- 사용자에게 **결과가 달라질 수 있을 때만 고지**한다.
- 항상 무료배송이라면 내부 배송 정책은 노출하지 않는다.
- 배송비가 판매자/배송 단위로 달라질 수 있다면 명확히 고지한다.

---

## 9. 향후 확장 포인트 (결제 연동 이후)

- payments 테이블 추가 (order_group 기준)
- 부분 환불 / 배송비 환불 정책 연동
- 판매자 정산 테이블 (배송비 포함 여부 결정)

---

## 10. 상세 테이블 스키마 (구현용)

> 현재 KEND 앱의 구현 상태를 반영한 상세 스키마

### 10.1 Enum 타입 정의

```sql
-- 주문 그룹 상태 (결제 단위)
CREATE TYPE order_group_status AS ENUM (
  'pending',           -- 결제 대기
  'paid',              -- 결제 완료
  'partially_refunded', -- 부분 환불
  'refunded',          -- 전액 환불
  'cancelled'          -- 취소
);

-- 주문 상태 (판매자별)
CREATE TYPE order_status AS ENUM (
  'pending',           -- 주문 접수
  'confirmed',         -- 주문 확인 (판매자)
  'preparing',         -- 상품 준비중
  'shipped',           -- 발송 완료
  'delivered',         -- 배송 완료
  'cancelled'          -- 취소
);

-- 배송 상태
CREATE TYPE delivery_status AS ENUM (
  'pending',           -- 배송 대기
  'preparing',         -- 상품 준비중
  'shipped',           -- 발송됨
  'in_transit',        -- 배송중
  'delivered'          -- 배송 완료
);

-- 배송 아이템 상태
CREATE TYPE delivery_item_status AS ENUM (
  'normal',            -- 정상
  'cancelled',         -- 취소됨
  'return_requested',  -- 반품 요청
  'returned',          -- 반품 완료
  'exchange_requested', -- 교환 요청
  'exchanged'          -- 교환 완료
);

-- 배송비 타입 (기존 DeliveryInfo 기반)
CREATE TYPE shipping_fee_type AS ENUM (
  'FREE',              -- 무료배송
  'PAID',              -- 유료 (선결제)
  'COD',               -- 착불
  'CONDITIONAL'        -- 조건부 무료
);
```

### 10.2 order_groups (주문 그룹 / 체크아웃 단위)

> 사용자 기준 "한 번의 결제" 단위

```sql
CREATE TABLE order_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,

  -- 주문번호 (고객용, 예: ORD-20250128-A1B2C)
  order_number TEXT NOT NULL UNIQUE,

  -- 상태
  status order_group_status NOT NULL DEFAULT 'pending',

  -- 금액
  total_product_amount INTEGER NOT NULL,     -- 상품 금액 합계
  total_shipping_fee INTEGER NOT NULL,       -- 배송비 합계
  total_discount_amount INTEGER DEFAULT 0,   -- 할인 금액 (쿠폰 등, TBD)
  total_amount INTEGER NOT NULL,             -- 최종 결제 금액

  -- 배송지 스냅샷 (주문 시점 저장)
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  zone_code TEXT NOT NULL,
  address TEXT NOT NULL,
  address_detail TEXT,

  -- 결제 정보 (TBD)
  payment_method TEXT,                       -- 결제 수단
  paid_at TIMESTAMPTZ,                       -- 결제 완료 시각

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_groups_user_id ON order_groups(user_id);
CREATE INDEX idx_order_groups_status ON order_groups(status);
CREATE INDEX idx_order_groups_created_at ON order_groups(created_at DESC);
```

### 10.3 orders (판매자별 주문)

> 판매자 기준 주문 단위, order_group 하위

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_group_id UUID NOT NULL REFERENCES order_groups(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(profile_id),

  -- 주문번호 (판매자용, 예: ORD-20250128-A1B2C-01)
  order_number TEXT NOT NULL UNIQUE,

  -- 상태
  status order_status NOT NULL DEFAULT 'pending',

  -- 금액
  product_amount INTEGER NOT NULL,           -- 상품 금액 합계
  shipping_fee INTEGER NOT NULL,             -- 배송비
  total_amount INTEGER NOT NULL,             -- 합계

  -- 판매자 스냅샷
  seller_name TEXT NOT NULL,
  seller_code TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_order_group_id ON orders(order_group_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### 10.4 order_items (주문 상품)

> 주문 내 개별 상품, 스냅샷 저장

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- 원본 참조 (히스토리용, 삭제되어도 주문 데이터는 유지)
  sku_id UUID REFERENCES product_stock_keepings(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- 상품 스냅샷
  product_name TEXT NOT NULL,
  product_code TEXT NOT NULL,
  sku_code TEXT NOT NULL,
  options JSONB,                             -- {"색상": "검정", "사이즈": "M"}
  main_image TEXT,

  -- 가격 스냅샷
  regular_price INTEGER NOT NULL,            -- 정가
  sale_price INTEGER NOT NULL,               -- 판매가
  quantity INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,                 -- sale_price * quantity

  -- 배송 정책 스냅샷 (SKU의 배송 정보)
  shipping_fee_type shipping_fee_type NOT NULL,
  base_shipping_fee INTEGER NOT NULL DEFAULT 0,
  free_shipping_condition_value INTEGER,     -- 무료배송 기준금액
  ship_from_region TEXT,                     -- 출고지역

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_sku_id ON order_items(sku_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### 10.5 deliveries (배송)

> 물류 단위, 판매자가 생성/관리

```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- 상태
  status delivery_status NOT NULL DEFAULT 'pending',

  -- 택배 정보
  courier TEXT,                              -- 택배사 (CJ대한통운, 한진 등)
  tracking_number TEXT,                      -- 송장번호

  -- 배송비
  shipping_fee INTEGER NOT NULL DEFAULT 0,

  -- 배송 일시
  shipped_at TIMESTAMPTZ,                    -- 발송 일시
  delivered_at TIMESTAMPTZ,                  -- 배송 완료 일시

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_tracking ON deliveries(courier, tracking_number);
```

### 10.6 delivery_items (배송 내 상품) ⭐

> 부분취소/교환의 핵심 단위

```sql
CREATE TABLE delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,

  -- 수량 (order_item의 일부만 배송될 수 있음)
  quantity INTEGER NOT NULL,

  -- 상태 (부분취소/교환 처리용)
  status delivery_item_status NOT NULL DEFAULT 'normal',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_delivery_items_delivery_id ON delivery_items(delivery_id);
CREATE INDEX idx_delivery_items_order_item_id ON delivery_items(order_item_id);
CREATE INDEX idx_delivery_items_status ON delivery_items(status);
```

---

## 11. 테이블 관계 다이어그램

```
┌─────────────────┐
│  order_groups   │ ← 결제 단위 (사용자)
│  - 배송지 스냅샷  │
│  - 결제 정보     │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│     orders      │ ← 판매자별 주문
│  - 판매자 스냅샷  │
└────────┬────────┘
         │ 1:N
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌─────────────┐
│ order_  │ │ deliveries  │ ← 배송 단위
│ items   │ │             │
│(스냅샷) │ └──────┬──────┘
└────┬────┘        │ 1:N
     │             ▼
     │      ┌─────────────┐
     └─────→│ delivery_   │ ← 부분취소/교환 단위
            │ items       │
            └─────────────┘
```

---

## 12. 한 줄 요약

- 주문은 계약, 배송은 물류
- 주문은 덜 쪼개고, 배송은 더 쪼갠다
- 멀티 셀러에서는 판매자 기준이 모든 판단의 출발점이다
- **스냅샷은 필수**: 상품/가격/배송지는 주문 시점 기준으로 저장

---

(End of Document)

