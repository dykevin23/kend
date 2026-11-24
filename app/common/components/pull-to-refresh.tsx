import { useEffect, useRef, useState } from "react";
import { useRevalidator } from "react-router";
import { RotateCw } from "lucide-react";
import { cn } from "~/lib/utils";

const TRIGGER_DISTANCE = 64; // 이만큼 당기면 놓았을 때 새로고침
const MAX_DISTANCE = 96;
const MIN_SPIN_MS = 500; // 너무 빨리 끝나도 돌고 있었다는 걸 보여주기

/**
 * 당겨서 새로고침 — 스크롤 영역 맨 위에서 아래로 당기면 현재 화면 데이터(loader)만 다시 불러온다.
 * 페이지 전체를 다시 띄우지 않아 빠르고, iOS·Android·브라우저 모두 같은 동작 (native 수정 없음).
 *
 * 다른 사람(판매자·운영자·시스템)이 내용을 바꾸는 단순 목록 화면에만 쓴다 —
 * 입력·편집이 있는 화면은 당기다 작성 내용이 날아갈 수 있어 쓰지 않는다.
 * 사용: <Content pullToRefresh> (Content가 스크롤 영역 ref를 넘긴다)
 */
export function usePullToRefresh(
  scrollRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
) {
  const revalidator = useRevalidator();
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const distanceRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!enabled || !el) return;

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current || el.scrollTop > 0) return;
      startYRef.current = e.touches[0].clientY;
    };

    const onMove = (e: TouchEvent) => {
      if (startYRef.current === null) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy <= 0 || el.scrollTop > 0) {
        // 위로 미는 중 = 일반 스크롤
        if (distanceRef.current !== 0) {
          distanceRef.current = 0;
          setDistance(0);
        }
        return;
      }
      e.preventDefault(); // 당기는 동안은 스크롤 대신 당김 표시
      const next = Math.min(MAX_DISTANCE, dy * 0.5); // 손가락보다 덜 따라오게(저항감)
      distanceRef.current = next;
      setDistance(next);
    };

    const onEnd = () => {
      if (startYRef.current === null) return;
      startYRef.current = null;
      const pulled = distanceRef.current;
      distanceRef.current = 0;
      setDistance(0);
      if (pulled >= TRIGGER_DISTANCE) {
        refreshingRef.current = true;
        setRefreshing(true);
        const startedAt = Date.now();
        Promise.resolve(revalidator.revalidate()).finally(() => {
          const wait = Math.max(0, MIN_SPIN_MS - (Date.now() - startedAt));
          setTimeout(() => {
            refreshingRef.current = false;
            setRefreshing(false);
          }, wait);
        });
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
    // revalidator 객체는 렌더마다 바뀌지만 revalidate 동작은 같다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, scrollRef]);

  return { distance, refreshing };
}

/** 스크롤 영역 맨 위에 붙는 당김/새로고침 표시 */
export function PullToRefreshIndicator({
  distance,
  refreshing,
}: {
  distance: number;
  refreshing: boolean;
}) {
  const height = refreshing ? 48 : distance;
  if (height <= 0) return null;
  const ready = distance >= TRIGGER_DISTANCE;

  return (
    <div
      className="flex items-end justify-center overflow-hidden"
      style={{ height, transition: refreshing || distance === 0 ? "height 150ms" : undefined }}
      aria-live="polite"
    >
      <div className="flex items-center justify-center size-9 mb-1.5 rounded-full bg-white shadow-sm">
        <RotateCw
          className={cn("size-4 text-primary", refreshing && "animate-spin")}
          style={refreshing ? undefined : { transform: `rotate(${distance * 3}deg)`, opacity: ready ? 1 : 0.5 }}
          strokeWidth={2.2}
        />
      </div>
      <span className="sr-only">{refreshing ? "새로고침 중" : ready ? "놓으면 새로고침" : "당겨서 새로고침"}</span>
    </div>
  );
}
