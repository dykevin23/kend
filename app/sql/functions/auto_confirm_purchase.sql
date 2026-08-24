-- ============================================================
-- auto_confirm_purchase + pg_cron 등록 (Phase 2.5 / P2.5-2)
-- 배송완료 후 7일 안에 구매자가 수동 구매확정을 안 하면 자동으로 확정한다.
--
-- ⚠️ 2026-08-21 수정: 구매확정을 orders(주문 단위)에서 delivery_items(상품 단위)로
-- 이전(P2.5-3 후속) — 한 주문 안에서도 상품별로 반품 진행 여부가 갈릴 수 있어서다.
-- 반품/교환 진행중이거나(status<>'normal') 이미 구매확정된 상품은 대상에서 제외.
--
-- 구매확정 시각(delivery_items.purchase_confirmed_at)은 Phase 3.5 정산 대상
-- 판정 기준이자, 확정 이후 반품/교환 채널이 닫히고 "문의하기"(AS)로만 접수되는
-- 기준점이다 (kend UI에서 delivered && status='normal' && !purchase_confirmed_at일
-- 때만 반품/교환/구매확정 버튼 노출).
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
  UPDATE delivery_items di
     SET purchase_confirmed_at = now(),
         updated_at = now()
    FROM order_items oi, orders o, deliveries d
   WHERE di.order_item_id = oi.id
     AND oi.order_id = o.id
     AND d.order_id = o.id
     AND o.status = 'delivered'
     AND di.status = 'normal'
     AND di.purchase_confirmed_at IS NULL
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
