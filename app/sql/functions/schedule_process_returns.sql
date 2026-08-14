-- ============================================================
-- schedule_process_returns (P2.5-3)
-- kend-seller가 반품을 승인(delivery_items.status = 'returned')하면, 실제 Toss
-- 부분환불/재고복원/order_group 집계는 kend의 /api/cron/process-returns 라우트가
-- 처리한다 (TOSS_SECRET_KEY가 kend에만 있어 kend-seller가 직접 못 함).
--
-- 기존 크론(expire_unshipped_orders 등)은 DB 내부 로직만으로 끝나 순수 plpgsql이었지만,
-- 이번엔 외부(kend Node 서버) 호출이 필요해 이 프로젝트에서 처음으로 pg_net을 쓴다.
--
-- ⚠️ 적용 전 아래 두 값을 실제 값으로 바꿔야 한다:
--   1. url            → kend가 배포된 공개 도메인 (예: https://kend.app/api/cron/process-returns)
--                        로컬/스테이징만 있고 프로덕션 도메인이 아직 없다면(P4-3 미완료),
--                        이 크론은 도메인이 확정되기 전까지 등록을 미뤄도 된다 — 라우트
--                        자체는 curl로 수동 호출해서 먼저 테스트 가능.
--   2. x-cron-secret  → kend .env의 CRON_SECRET 값과 반드시 동일해야 한다.
--
-- Supabase SQL Editor에서 실행
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.unschedule('process-approved-returns')
 WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-approved-returns');

SELECT cron.schedule(
  'process-approved-returns',
  '*/10 * * * *', -- 10분마다
  $$
  SELECT net.http_post(
    url := 'https://REPLACE_WITH_KEND_DOMAIN/api/cron/process-returns',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'REPLACE_WITH_CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);
