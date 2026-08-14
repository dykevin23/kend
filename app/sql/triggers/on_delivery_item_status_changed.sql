-- ============================================================
-- log_delivery_item_status_history (P2.5-3)
-- delivery_items가 생성되거나 상태 관련 컬럼이 바뀔 때마다 entity_status_history에
-- 스냅샷을 한 줄씩 남긴다. 앱 코드가 아니라 트리거라서, kend/kend-seller/크론
-- 어느 경로로 바뀌든(누가 UPDATE 했든) 빠짐없이 잡힌다.
--
-- status만으로 안 잡히는 세부 변화(같은 return_requested 안에서의 1차승인/거절 등)는
-- snapshot(jsonb)에 관련 컬럼을 통째로 담아 보완한다.
--
-- Supabase SQL Editor에서 실행
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_delivery_item_status_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND
     NEW.status IS NOT DISTINCT FROM OLD.status AND
     NEW.reason IS NOT DISTINCT FROM OLD.reason AND
     NEW.return_approved_at IS NOT DISTINCT FROM OLD.return_approved_at AND
     NEW.return_received_at IS NOT DISTINCT FROM OLD.return_received_at AND
     NEW.reject_reason IS NOT DISTINCT FROM OLD.reject_reason AND
     NEW.refunded_at IS NOT DISTINCT FROM OLD.refunded_at THEN
    RETURN NEW;
  END IF;

  INSERT INTO entity_status_history (entity_type, entity_id, status, snapshot)
  VALUES (
    'delivery_item',
    NEW.id,
    NEW.status,
    jsonb_build_object(
      'reason', NEW.reason,
      'return_approved_at', NEW.return_approved_at,
      'return_received_at', NEW.return_received_at,
      'reject_reason', NEW.reject_reason,
      'refunded_at', NEW.refunded_at
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS delivery_item_status_history ON delivery_items;

CREATE TRIGGER delivery_item_status_history
AFTER INSERT OR UPDATE ON delivery_items
FOR EACH ROW
EXECUTE FUNCTION public.log_delivery_item_status_history();
