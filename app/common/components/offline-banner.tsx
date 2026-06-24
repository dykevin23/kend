import { useNetworkStatus } from "~/hooks/useNetworkStatus";

/**
 * 오프라인 시 화면 상단에 표시되는 안내 배너.
 * 온라인 복귀 시 자동으로 사라진다.
 */
export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-center text-sm text-white"
      style={{
        paddingTop: "calc(0.5rem + var(--safe-area-inset-top, 0px))",
        paddingBottom: "0.5rem",
      }}
    >
      인터넷 연결을 확인해주세요
    </div>
  );
}
