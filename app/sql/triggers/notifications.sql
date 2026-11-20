-- ============================================================
-- 앱 푸시 알림 — 트리거·함수·재시도 크론 (readme/todo/push-notification-plan.md)
--
-- 테이블(push_tokens·notification_settings·notifications)은 Drizzle 마이그레이션
-- (0035)으로 먼저 만들고, 이 파일을 각 환경(dev → prod) SQL Editor 또는 psql로 실행한다.
-- 여러 번 실행해도 안전하다(CREATE OR REPLACE / DROP IF EXISTS).
--
-- 흐름
--   상태 변경(kend·seller·크론 어디서든) → notify_* 트리거 → enqueue_notification()
--   → notifications insert → kick_send_push(문장 단위 트리거) → pg_net → Edge Function send-push
--   → claim_pending_notifications()로 묶음을 가져가 Expo Push API로 발송 → 결과 기록
--   5분 크론 retry_push_notifications(): 처리 중 멈춘 건 되돌리고, 남은 대기 건 재발송
--
-- ⚠️ 원칙: 알림은 부가 기능 — 알림 처리 중 오류가 나도 주문·취소·답변 같은 본 작업이
--    실패하면 안 된다. 그래서 모든 notify_* 트리거는 EXCEPTION으로 감싸 경고만 남긴다.
--
-- 사전 준비: Vault의 project_url · secret_key (seller sync-tracking 크론과 같은 값, 이미 등록됨)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- ------------------------------------------------------------
-- 1. 기기 토큰 등록/해제 (웹 서버가 사용자 세션으로 호출)
--    같은 기기에서 다른 계정으로 로그인하면 토큰 소유자를 새 계정으로 옮겨야 하는데,
--    RLS상 남의 행은 못 고치므로 SECURITY DEFINER 함수로 처리한다. 호출자는 auth.uid()로만 식별.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_push_token(p_token text, p_platform text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF p_token IS NULL OR p_token !~ '^Expo(nent)?PushToken\[.+\]$' THEN
    RAISE EXCEPTION 'invalid push token';
  END IF;
  IF p_platform NOT IN ('ios', 'android') THEN
    RAISE EXCEPTION 'invalid platform';
  END IF;

  INSERT INTO push_tokens (user_id, token, platform)
  VALUES (v_uid, p_token, p_platform)
  ON CONFLICT (token) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        platform = EXCLUDED.platform,
        last_seen_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.unregister_push_token(p_token text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM push_tokens WHERE token = p_token AND user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.register_push_token(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.unregister_push_token(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_push_token(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unregister_push_token(text) TO authenticated;

-- ------------------------------------------------------------
-- 2. 알림 적재 — 수신 설정이 꺼져 있으면 skipped로 남긴다(알림함에는 보임)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enqueue_notification(
  p_user_id uuid,
  p_type notification_type,
  p_title text,
  p_body text,
  p_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enabled boolean;
BEGIN
  SELECT CASE WHEN p_type = 'inquiry_answered' THEN s.inquiry_updates
              ELSE s.order_updates END
    INTO v_enabled
    FROM notification_settings s
   WHERE s.user_id = p_user_id;

  INSERT INTO notifications (user_id, type, title, body, url, push_status)
  VALUES (
    p_user_id, p_type, p_title, p_body, p_url,
    CASE WHEN coalesce(v_enabled, true) THEN 'pending' ELSE 'skipped' END::push_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_notification(uuid, notification_type, text, text, text)
  FROM PUBLIC, anon, authenticated;

-- ------------------------------------------------------------
-- 3. 상태 변경 트리거
-- ------------------------------------------------------------

-- 3-1. 주문 그룹: 결제 완료 / 취소 / 환불
--   취소·환불은 "결제 완료였던 주문"에서 바뀐 경우만 — 결제 포기(payment_in_progress → failed)나
--   결제 전 정리에는 알림을 보내지 않는다.
CREATE OR REPLACE FUNCTION public.notify_order_group_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text := '/orders/' || NEW.id;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  BEGIN
    IF NEW.status = 'paid' AND OLD.status IN ('payment_in_progress', 'payment_pending') THEN
      PERFORM enqueue_notification(NEW.user_id, 'order_paid',
        '주문이 완료되었어요',
        '주문번호 ' || NEW.order_number || ' 결제가 완료되었어요.', v_url);

    ELSIF NEW.status = 'cancelled' AND OLD.status IN ('paid', 'partially_refunded') THEN
      PERFORM enqueue_notification(NEW.user_id, 'order_cancelled',
        '주문이 취소되었어요',
        '주문번호 ' || NEW.order_number || ' 주문이 취소되었어요.', v_url);

    ELSIF NEW.status IN ('refunded', 'partially_refunded') AND OLD.status IN ('paid', 'partially_refunded') THEN
      PERFORM enqueue_notification(NEW.user_id, 'order_refunded',
        CASE WHEN NEW.status = 'refunded' THEN '환불이 완료되었어요'
             ELSE '일부 상품의 환불이 완료되었어요' END,
        '주문번호 ' || NEW.order_number || ' 환불이 완료되었어요.', v_url);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_order_group_status failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_order_group_status ON order_groups;
CREATE TRIGGER notify_order_group_status
AFTER UPDATE OF status ON order_groups
FOR EACH ROW
EXECUTE FUNCTION public.notify_order_group_status();

-- 3-2. 배송: 발송(판매자 송장 등록) / 배송 완료(배송추적 크론)
CREATE OR REPLACE FUNCTION public.notify_delivery_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_group_id uuid;
  v_seller text;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status
     OR NEW.status NOT IN ('shipped', 'delivered') THEN
    RETURN NEW;
  END IF;

  BEGIN
    SELECT og.user_id, og.id, o.seller_name
      INTO v_user_id, v_group_id, v_seller
      FROM orders o
      JOIN order_groups og ON og.id = o.order_group_id
     WHERE o.id = NEW.order_id;

    IF v_user_id IS NULL THEN
      RETURN NEW;
    END IF;

    IF NEW.status = 'shipped' AND OLD.status NOT IN ('in_transit', 'delivered') THEN
      PERFORM enqueue_notification(v_user_id, 'order_shipped',
        '상품이 발송되었어요',
        v_seller || '에서 주문하신 상품이 출발했어요.', '/orders/' || v_group_id);

    ELSIF NEW.status = 'delivered' THEN
      PERFORM enqueue_notification(v_user_id, 'order_delivered',
        '배송이 완료되었어요',
        v_seller || ' 상품이 도착했어요. 받으신 상품을 확인해 주세요.', '/orders/' || v_group_id);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_delivery_status failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_delivery_status ON deliveries;
CREATE TRIGGER notify_delivery_status
AFTER UPDATE OF status ON deliveries
FOR EACH ROW
EXECUTE FUNCTION public.notify_delivery_status();

-- 3-3. 반품 승인 (판매자 최종 승인 = delivery_items.status → returned)
--   실제 환불은 이후 process-returns 크론이 처리하고, 그때 3-1의 "환불 완료"가 따로 나간다.
CREATE OR REPLACE FUNCTION public.notify_delivery_item_returned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_group_id uuid;
  v_product text;
BEGIN
  IF NEW.status <> 'returned' OR OLD.status = 'returned' THEN
    RETURN NEW;
  END IF;

  BEGIN
    SELECT og.user_id, og.id, oi.product_name
      INTO v_user_id, v_group_id, v_product
      FROM deliveries d
      JOIN orders o ON o.id = d.order_id
      JOIN order_groups og ON og.id = o.order_group_id
      LEFT JOIN order_items oi ON oi.id = NEW.order_item_id
     WHERE d.id = NEW.delivery_id;

    IF v_user_id IS NOT NULL THEN
      PERFORM enqueue_notification(v_user_id, 'return_approved',
        '반품이 승인되었어요',
        coalesce(v_product, '주문하신 상품') || ' 반품이 승인되었어요. 환불은 곧 진행돼요.',
        '/orders/' || v_group_id);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_delivery_item_returned failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_delivery_item_returned ON delivery_items;
CREATE TRIGGER notify_delivery_item_returned
AFTER UPDATE OF status ON delivery_items
FOR EACH ROW
EXECUTE FUNCTION public.notify_delivery_item_returned();

-- 3-4. 문의 답변 (판매자)
CREATE OR REPLACE FUNCTION public.notify_inquiry_answered()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status <> 'answered' OR OLD.status = 'answered' THEN
    RETURN NEW;
  END IF;

  BEGIN
    PERFORM enqueue_notification(NEW.user_id, 'inquiry_answered',
      '문의 답변이 등록되었어요',
      '남기신 문의에 답변이 등록되었어요. 확인해 보세요.',
      '/myPage/inquiries/' || NEW.id);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_inquiry_answered failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_inquiry_answered ON inquiries;
CREATE TRIGGER notify_inquiry_answered
AFTER UPDATE OF status ON inquiries
FOR EACH ROW
EXECUTE FUNCTION public.notify_inquiry_answered();

-- ------------------------------------------------------------
-- 4. 발송 호출 — 알림이 쌓이면 바로 send-push를 깨운다
--    pg_net 요청은 트랜잭션 커밋 후에 나가므로, 본 작업이 롤백되면 호출도 사라진다.
--    send-push는 대기 건 전체를 묶어 가져가므로 호출이 여러 번 와도 중복 발송되지 않는다.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.call_send_push()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text;
  v_key text;
BEGIN
  SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'project_url';
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'secret_key';
  IF v_url IS NULL OR v_key IS NULL THEN
    RAISE WARNING 'call_send_push: vault project_url/secret_key 없음';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := v_url || '/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', v_key),
    body := '{}'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.call_send_push() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.kick_send_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM new_rows WHERE push_status = 'pending') THEN
    PERFORM call_send_push();
  END IF;
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'kick_send_push failed: %', SQLERRM;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS kick_send_push ON notifications;
CREATE TRIGGER kick_send_push
AFTER INSERT ON notifications
REFERENCING NEW TABLE AS new_rows
FOR EACH STATEMENT
EXECUTE FUNCTION public.kick_send_push();

-- ------------------------------------------------------------
-- 5. send-push 전용: 대기 건을 "처리 중"으로 바꾸며 가져간다
--    (SKIP LOCKED — 호출이 겹쳐도 같은 알림을 두 번 가져가지 않음). secret 키(service_role)만 실행.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_pending_notifications(p_limit int DEFAULT 100)
RETURNS TABLE (id uuid, user_id uuid, title text, body text, url text, attempts int)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE notifications n
     SET push_status = 'sending',
         attempts = n.attempts + 1,
         claimed_at = now()
   WHERE n.id IN (
     SELECT q.id FROM notifications q
      WHERE q.push_status = 'pending'
      ORDER BY q.created_at
      LIMIT p_limit
      FOR UPDATE SKIP LOCKED
   )
  RETURNING n.id, n.user_id, n.title, n.body, n.url, n.attempts;
$$;

REVOKE ALL ON FUNCTION public.claim_pending_notifications(int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_pending_notifications(int) TO service_role;

-- ------------------------------------------------------------
-- 6. 재시도 크론 (5분)
--    - 처리 중(sending)으로 5분 넘게 멈춘 건: 3회 미만이면 대기로 되돌리고, 아니면 failed
--    - 하루 지난 대기 건은 failed (며칠 뒤 "주문 완료" 같은 늦은 푸시 방지 — 알림함엔 남음)
--    - 대기 건이 남아 있으면 send-push 호출
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.retry_push_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
     SET push_status = CASE WHEN attempts >= 3 THEN 'failed' ELSE 'pending' END::push_status,
         error = coalesce(error, 'stuck in sending')
   WHERE push_status = 'sending'
     AND claimed_at < now() - interval '5 minutes';

  UPDATE notifications
     SET push_status = 'failed', error = coalesce(error, 'expired (24h)')
   WHERE push_status = 'pending'
     AND created_at < now() - interval '1 day';

  IF EXISTS (SELECT 1 FROM notifications WHERE push_status = 'pending') THEN
    PERFORM call_send_push();
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.retry_push_notifications() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule('retry-push-notifications')
 WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'retry-push-notifications');

SELECT cron.schedule(
  'retry-push-notifications',
  '*/5 * * * *',
  $$ SELECT public.retry_push_notifications(); $$
);
