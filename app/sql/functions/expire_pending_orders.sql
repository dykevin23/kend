-- ============================================================
-- expire_pending_orders + pg_cron 등록
-- payment_in_progress 상태로 일정 시간 이상 경과한 주문을 failed로 정리한다
-- (P1-4 "남은 일" 체크리스트 / toss-payments.md §6, 결제 이탈·redirect 콜백 실패 대응).
--
-- ⚠️ 2026-07-27 수정: 재고 복원 트리거(restore_stock_on_order_cancel.sql)가
-- order_groups가 아니라 orders.status 기준으로 바뀌었기 때문에, 여기서도
-- order_group을 failed 처리할 때 하위 orders.status를 cancelled로 함께 맞춰야
-- 트리거가 걸려 재고가 복원된다 (order_groups만 바꾸면 재고가 안 돌아옴).
--
-- 외부 API 호출이 없는 순수 DB 작업이라 Edge Function 없이 pg_cron에서
-- 함수를 직접 호출한다 (kend-seller의 sync-tracking처럼 pg_net이 필요 없음).
--
-- Supabase SQL Editor에서 실행
-- ============================================================

CREATE OR REPLACE FUNCTION expire_pending_orders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_group_ids UUID[];
BEGIN
  SELECT array_agg(id) INTO v_group_ids
    FROM order_groups
   WHERE status = 'payment_in_progress'
     AND created_at < now() - interval '30 minutes';

  IF v_group_ids IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE order_groups
     SET status = 'failed',
         updated_at = now()
   WHERE id = ANY(v_group_ids);

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE orders
     SET status = 'cancelled',
         updated_at = now()
   WHERE order_group_id = ANY(v_group_ids)
     AND status <> 'cancelled';

  RETURN v_count;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.schedule(
  'expire-pending-orders',
  '*/10 * * * *', -- 10분마다 실행 (30분 임계치보다 충분히 촘촘하게)
  $$ SELECT expire_pending_orders(); $$
);
