import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

const getSnapshot = () => navigator.onLine;

// SSR: 서버에는 navigator가 없으므로 항상 온라인으로 가정한다.
// useSyncExternalStore가 hydration 직후 클라이언트 스냅샷으로 자동 보정하므로
// mismatch 에러 없이 안전하다.
const getServerSnapshot = () => true;

/**
 * 브라우저 online/offline 이벤트 기반 네트워크 상태 감지.
 * @returns `{ isOnline }` — 오프라인이면 false
 */
export function useNetworkStatus() {
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return { isOnline };
}
