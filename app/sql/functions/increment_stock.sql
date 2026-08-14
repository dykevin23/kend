-- ============================================================
-- increment_stock
-- 반품 승인 환불 처리 시(P2.5-3) SKU 재고를 원자적으로 복원한다.
--
-- 취소 시 재고복원은 on_order_cancelled.sql 트리거가 order 단위로 직접
-- UPDATE하지만, 반품은 delivery_item(상품/수량) 단위로 processApprovedReturns가
-- 호출 경로 하나뿐이라 트리거 대신 RPC로 둔다 (decrement_stock과 대칭).
--
-- Supabase SQL Editor에서 실행 후 npm run db:typegen 으로 타입 재생성
-- ============================================================

CREATE OR REPLACE FUNCTION increment_stock(
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
     SET stock = stock + p_quantity
   WHERE id = p_sku_id;
END;
$$;
