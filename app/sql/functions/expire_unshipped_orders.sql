-- ============================================================
-- expire_unshipped_orders + pg_cron 등록 (Phase 2.5 / P2.5-1)
-- 판매자가 주문확인(confirmed) 후 3일 안에 발송(shipped)까지 못 간 주문을
-- 자동취소한다.
--
-- ⚠️ 선행조건: kend-seller의 주문확인 액션(updateOrderStatus 등)이
-- status를 confirmed로 바꿀 때 orders.confirmed_at도 같이 세팅해줘야
-- 이 함수가 대상을 찾을 수 있다 (단일 호출 경로라 트리거 대신 앱 코드에서
-- 직접 세팅하기로 함 — 재고 트리거처럼 여러 경로가 아니라 하나뿐이라 과함).
--
-- 취소는 orders.status='cancelled'만 하면 되고, 기존 handle_order_cancelled
-- 트리거가 재고 복원 + 그룹 승격을 그대로 처리한다.
--
-- Supabase SQL Editor에서 실행
-- ============================================================

CREATE OR REPLACE FUNCTION expire_unshipped_orders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE orders
     SET status = 'cancelled',
         updated_at = now()
   WHERE status IN ('confirmed', 'preparing')
     AND confirmed_at IS NOT NULL
     AND confirmed_at < now() - interval '3 days';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.unschedule('expire-unshipped-orders')
 WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-unshipped-orders');

SELECT cron.schedule(
  'expire-unshipped-orders',
  '0 * * * *', -- 매시 정각
  $$ SELECT expire_unshipped_orders(); $$
);
