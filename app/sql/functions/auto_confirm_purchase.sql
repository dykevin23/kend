-- ============================================================
-- auto_confirm_purchase + pg_cron 등록 (Phase 2.5 / P2.5-2)
-- 배송완료 후 7일 안에 구매자가 수동 구매확정을 안 하면 자동으로 확정한다.
--
-- 구매확정 시각(orders.purchase_confirmed_at)은 Phase 3.5 정산 대상 판정
-- 기준이자, 확정 이후 반품/교환 채널이 닫히고 "문의하기"(AS)로만 접수되는
-- 기준점이다 (kend UI에서 delivered && !purchase_confirmed_at일 때만
-- 반품/교환/구매확정 버튼 노출).
--
-- Supabase SQL Editor에서 실행
-- ============================================================

CREATE OR REPLACE FUNCTION auto_confirm_purchase()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE orders o
     SET purchase_confirmed_at = now(),
         updated_at = now()
    FROM deliveries d
   WHERE d.order_id = o.id
     AND o.status = 'delivered'
     AND o.purchase_confirmed_at IS NULL
     AND d.delivered_at IS NOT NULL
     AND d.delivered_at < now() - interval '7 days';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.unschedule('auto-confirm-purchase')
 WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-confirm-purchase');

SELECT cron.schedule(
  'auto-confirm-purchase',
  '0 3 * * *', -- 매일 새벽 3시 (7일 단위 SLA라 촘촘한 주기 불필요)
  $$ SELECT auto_confirm_purchase(); $$
);
