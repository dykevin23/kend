-- ============================================================
-- schedule_process_returns (P2.5-3)
-- kend-seller가 반품을 승인(delivery_items.status = 'returned')하면, 실제 Toss
-- 부분환불/재고복원/order_group 집계는 kend의 /api/cron/process-returns 라우트가
-- 처리한다 (TOSS_SECRET_KEY가 kend에만 있어 kend-seller가 직접 못 함).
--
-- 기존 크론(expire_unshipped_orders 등)은 DB 내부 로직만으로 끝나 순수 plpgsql이었지만,
-- 이번엔 외부(kend Node 서버) 호출이 필요해 이 프로젝트에서 처음으로 pg_net을 쓴다.
--
-- 호출 주소와 비밀값은 Vault에서 읽는다 (SQL·cron.job에 평문으로 남기지 않고, 같은 SQL을
-- 환경마다 그대로 쓰기 위함 — seller sync-tracking 크론과 같은 방식).
--
-- 사전 준비 (적용 전, 해당 프로젝트 SQL Editor에서 1회 — 비밀값이라 git에 넣지 않는다.
-- vault.create_secret(값, 이름) 순서 주의):
--   select vault.create_secret('<그 환경 kend 서버의 CRON_SECRET>', 'cron_secret');
--   select vault.create_secret('https://kend.co.kr', 'kend_app_url');   -- 운영
-- 개발(dev)은 개발 서버가 Vercel 배포 보호 뒤에 있어 등록하지 않는다 — 라우트는 curl로 수동 테스트.
--
-- 운영 적용: 2026-11 환경분리 (prod Vercel CRON_SECRET = .env.production의 PROD_CRON_SECRET)
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
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'kend_app_url')
           || '/api/cron/process-returns',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
