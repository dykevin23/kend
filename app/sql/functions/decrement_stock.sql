-- ============================================================
-- decrement_stock
-- 주문 생성 시 SKU 재고를 원자적으로 차감한다 (P2-4, B안: 주문 생성 시점 즉시 차감).
--
-- 재고가 부족하면 UPDATE가 0건이 되고 예외를 던져 createOrder가 실패하도록 한다
-- (동시 주문으로 인한 재고 음수화 방지).
--
-- Supabase SQL Editor에서 실행 후 npm run db:typegen 으로 타입 재생성
-- ============================================================

CREATE OR REPLACE FUNCTION decrement_stock(
  p_sku_id UUID,
  p_quantity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_stock_keepings
     SET stock = stock - p_quantity
   WHERE id = p_sku_id
     AND stock >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION '재고 부족 (sku_id: %, 요청 수량: %)', p_sku_id, p_quantity
      USING ERRCODE = 'P0001';
  END IF;
END;
$$;
