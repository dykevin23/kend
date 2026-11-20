import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { enablePush, getPushState } from "../push";

const DISMISSED_KEY = "kend_push_prompt_dismissed";

/**
 * 첫 주문 완료 직후 알림 권한 안내 카드 (readme/todo/push-notification-plan.md §4-1)
 * - 앱에서, 권한을 아직 묻지 않은(undetermined) 경우에만 보인다 — iOS는 한 번 거부하면 앱에서 다시 못 물어서,
 *   "왜 필요한지" 보이는 순간(주문 직후)에 묻는다
 * - 닫으면 다시 띄우지 않는다 (알림 설정 화면에서 언제든 켤 수 있음)
 */
export default function PushPromptCard() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      /* 무시 */
    }
    getPushState().then((state) => {
      if (state?.status === "undetermined") setVisible(true);
    });
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* 무시 */
    }
  };

  const handleEnable = async () => {
    setBusy(true);
    await enablePush();
    setBusy(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex items-start gap-3 mx-4 mt-3 p-4 rounded-xl bg-white border border-primary/20">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <BellRing className="size-[18px]" strokeWidth={1.8} />
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-gray-900">배송 소식을 알림으로 받아보세요</span>
          <span className="text-xs text-gray-500 leading-4">
            상품 발송, 배송 완료, 문의 답변을 바로 알려드려요.
          </span>
        </div>
        <button
          type="button"
          onClick={handleEnable}
          disabled={busy}
          className="self-start px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold disabled:opacity-50"
        >
          알림 받기
        </button>
      </div>
      <button type="button" onClick={dismiss} aria-label="닫기" className="text-gray-400">
        <X className="size-4" />
      </button>
    </div>
  );
}
