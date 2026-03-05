-- ============================================================
-- get_growth_percentile_history
-- 자녀의 측정값을 동일 월령·성별 전체 Kend 사용자 데이터와 비교하여
-- 각 측정 시점의 백분위 등수를 반환한다.
--
-- 공식: 백분위 = (내 아이보다 낮은 값의 수 / 전체 수) × 100
--
-- p_child_id : 자녀 UUID
-- p_type     : 'height' | 'weight' | 'head_circumference'
--
-- Supabase SQL Editor에서 실행 후 npm run db:typegen 으로 타입 재생성
-- ============================================================

CREATE OR REPLACE FUNCTION get_growth_percentile_history(
  p_child_id UUID,
  p_type     TEXT
)
RETURNS TABLE (
  measured_at TEXT,
  age_months  INTEGER,
  value       NUMERIC,
  percentile  NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gender     child_gender;
  v_birth_date DATE;
BEGIN
  -- 자녀의 성별·생년월일 조회
  SELECT c.gender, c.birth_date
    INTO v_gender, v_birth_date
    FROM children c
   WHERE c.id = p_child_id;

  IF v_gender IS NULL OR v_birth_date IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH child_measurements AS (
    -- 이 자녀의 측정 기록 + 월령 계산
    SELECT
      gr.measured_at::text AS measured_at,
      (
        EXTRACT(YEAR  FROM AGE(gr.measured_at::date, v_birth_date)) * 12 +
        EXTRACT(MONTH FROM AGE(gr.measured_at::date, v_birth_date))
      )::integer AS age_months,
      CASE p_type
        WHEN 'height'            THEN gr.height
        WHEN 'weight'            THEN gr.weight
        WHEN 'head_circumference'THEN gr.head_circumference
      END AS val
    FROM growth_records gr
    WHERE gr.child_id = p_child_id
      AND CASE p_type
            WHEN 'height'            THEN gr.height IS NOT NULL
            WHEN 'weight'            THEN gr.weight IS NOT NULL
            WHEN 'head_circumference'THEN gr.head_circumference IS NOT NULL
            ELSE FALSE
          END
  ),
  all_measurements AS (
    -- 동일 성별 모든 아이의 측정 기록 + 월령 계산 (더미 포함)
    SELECT
      (
        EXTRACT(YEAR  FROM AGE(gr.measured_at::date, c.birth_date)) * 12 +
        EXTRACT(MONTH FROM AGE(gr.measured_at::date, c.birth_date))
      )::integer AS age_months,
      CASE p_type
        WHEN 'height'            THEN gr.height
        WHEN 'weight'            THEN gr.weight
        WHEN 'head_circumference'THEN gr.head_circumference
      END AS val
    FROM growth_records gr
    JOIN children c ON gr.child_id = c.id
    WHERE c.gender = v_gender
      AND CASE p_type
            WHEN 'height'            THEN gr.height IS NOT NULL
            WHEN 'weight'            THEN gr.weight IS NOT NULL
            WHEN 'head_circumference'THEN gr.head_circumference IS NOT NULL
            ELSE FALSE
          END
  )
  SELECT
    cm.measured_at,
    cm.age_months,
    cm.val AS value,
    ROUND(
      COUNT(CASE WHEN am.val < cm.val THEN 1 END)::numeric
      / NULLIF(COUNT(*), 0)::numeric * 100,
      1
    ) AS percentile
  FROM child_measurements cm
  JOIN all_measurements am ON am.age_months = cm.age_months
  GROUP BY cm.measured_at, cm.age_months, cm.val
  ORDER BY cm.measured_at;
END;
$$;
