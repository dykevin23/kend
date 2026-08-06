-- ============================================================
-- expire_unconfirmed_orders + pg_cron 등록 (Phase 2.5 / P2.5-1)
-- 판매자가 3일 안에 주문확인(pending→confirmed)을 안 한 건을 자동취소한다.
--
-- 취소는 orders.status='cancelled' 전이만 하면 되고, 기존
-- handle_order_cancelled 트리거가 재고 복원 + (그룹 내 전 주문 취소 시)
-- order_groups 승격까지 자동으로 처리한다 — 이 함수는 상태만 바꾼다.
--
-- 발송(확인 이후 실제 배송준비→발송) SLA는 별도 함수로 분리 예정
-- (일수 미정, 결정되면 추가).
--
-- Supabase SQL Editor에서 실행
-- ============================================================

CREATE OR REPLACE FUNCTION expire_unconfirmed_orders()
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
   WHERE status = 'pending'
     AND created_at < now() - interval '3 days';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.unschedule('expire-unconfirmed-orders')
 WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-unconfirmed-orders');

SELECT cron.schedule(
  'expire-unconfirmed-orders',
  '0 * * * *', -- 매시 정각 (3일 단위 SLA라 촘촘한 주기 불필요)
  $$ SELECT expire_unconfirmed_orders(); $$
);
