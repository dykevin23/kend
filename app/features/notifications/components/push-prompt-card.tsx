import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { openAppSettingsFromNative, type PushState } from "~/lib/native-bridge";
import { enablePush, getPushState, refreshPushToken } from "../push";

/**
 * 상황별 알림 안내 카드 (readme/active/push-notification-plan.md §4-1)
 * - 앱에서 알림이 꺼져 있을 때만 보인다 (허용 상태·브라우저·지원 안 하는 빌드는 숨김)
 *   - 아직 안 물어봄 → "알림 받기" = iOS 권한 팝업
 *   - 이미 거부 → "설정에서 켜기" = 설정 앱 (iOS는 한 번 거부하면 앱에서 다시 팝업 불가)
 * - 닫기는 이번만 숨김 — 다음 상황(다음 주문·문의)에 다시 안내한다
 * 첫 실행 때의 1회 권한 팝업은 root의 syncPushToken이 띄운다.
 */
export default function PushPromptCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [state, setState] = useState<PushState | null>(null);
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const refresh = () => getPushState().then(setState);
    refresh();
    // 설정 앱에서 켜고 돌아오면 카드를 숨긴다 (토큰 등록은 root가 처리)
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  if (hidden || !state || state.status === "granted") return null;

  const denied = state.status === "denied";

  const handleClick = async () => {
    setBusy(true);
    try {
      if (denied) {
        await openAppSettingsFromNative();
      } else {
        const next = await enablePush();
        if (next) setState(next);
        else await refreshPushToken();
      }
    } catch {
      /* 무시 */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-start gap-3 mx-4 mt-3 p-4 rounded-xl bg-white border border-primary/20">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <BellRing className="size-[18px]" strokeWidth={1.8} />
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-gray-900">{title}</span>
          <span className="text-xs text-gray-500 leading-4">
            {denied ? "기기 설정에서 KEND 알림을 허용하면 바로 받아볼 수 있어요." : description}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={busy}
          className="self-start px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold disabled:opacity-50"
        >
          {denied ? "설정에서 켜기" : "알림 받기"}
        </button>
      </div>
      <button type="button" onClick={() => setHidden(true)} aria-label="닫기" className="text-gray-400">
        <X className="size-4" />
      </button>
    </div>
  );
}
