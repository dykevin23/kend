-- ============================================================
-- handle_order_cancelled (구 restore_stock_on_order_cancel)
-- orders.status가 cancelled로 전이될 때:
--   1) 해당 주문(order_items)의 SKU 재고를 복원한다 (P2-4, B안)
--   2) 같은 order_group 하위 주문이 전부 cancelled가 됐다면
--      order_groups.status도 cancelled로 승격한다
--
-- ⚠️ 2026-07-27 최초 버전: order_groups.status 기준이었으나, kend-seller의
-- 판매자 취소(updateOrderStatus)가 orders.status만 바꾸고 order_groups.status는
-- 안 건드려 트리거가 안 걸리는 게 실사용 중 확인되어(재고 미복원) orders.status
-- 기준으로 변경.
--
-- ⚠️ 2026-07-27 추가: 위 수정 이후에도 order_groups.status가 paid로 남아있어
-- kend 주문내역 "취소/환불" 탭(order_groups.status로 필터링)에 안 잡히는 문제가
-- 실사용 중 발견됨 — 판매자가 1인인 주문을 판매자가 취소하면 그 주문이 곧 그룹의
-- 전부이므로 그룹도 cancelled여야 함. 다만 이미 payment_in_progress/failed/
-- refunded 등 다른 종결 상태인 그룹은 건드리지 않는다 (paid에서만 승격).
-- 여러 판매자가 섞인 주문에서 한쪽만 취소된 경우는 그룹을 승격하지 않는다
-- (다른 판매자 몫이 아직 살아있으므로 그룹 전체를 취소/환불로 취급하면 안 됨).
--
-- OLD.status가 이미 cancelled였다면(이중 트리거 방지) 재복원/재승격하지 않는다.
--
-- Supabase SQL Editor에서 실행
-- ============================================================

DROP TRIGGER IF EXISTS restore_stock_on_order_release ON order_groups;
DROP FUNCTION IF EXISTS public.restore_stock_on_order_release() CASCADE;

DROP TRIGGER IF EXISTS restore_stock_on_order_cancel ON orders;
DROP FUNCTION IF EXISTS public.restore_stock_on_order_cancel() CASCADE;

DROP FUNCTION IF EXISTS public.handle_order_cancelled() CASCADE;

CREATE FUNCTION public.handle_order_cancelled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    -- 1) 재고 복원
    UPDATE product_stock_keepings sk
       SET stock = sk.stock + oi.quantity
      FROM order_items oi
     WHERE oi.order_id = NEW.id
       AND sk.id = oi.sku_id;

    -- 2) 그룹 내 모든 주문이 취소됐으면 order_group도 cancelled로 승격
    IF NOT EXISTS (
      SELECT 1 FROM orders
       WHERE order_group_id = NEW.order_group_id
         AND status <> 'cancelled'
    ) THEN
      UPDATE order_groups
         SET status = 'cancelled', updated_at = now()
       WHERE id = NEW.order_group_id
         AND status = 'paid';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_order_cancelled
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_cancelled();
