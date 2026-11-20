import { useEffect, useState } from "react";
import { redirect, useFetcher, useLoaderData } from "react-router";
import Content from "~/common/components/content";
import { makeSSRClient } from "~/supa-client";
import { actionErrorResponse } from "~/lib/error-handler";
import { openAppSettingsFromNative, type PushState } from "~/lib/native-bridge";
import { enablePush, getPushState } from "~/features/notifications/push";
import { getNotificationPreferences } from "~/features/notifications/queries";
import { saveNotificationPreferences } from "~/features/notifications/mutations";
import type { Route } from "./+types/notifications-page";

/**
 * 알림 설정 (/myPage/notifications)
 * - 기기 알림 권한(앱에서만): 꺼짐 → 권한 요청 / 거부됨 → 설정 앱 열기
 * - 알림 종류별 수신 설정: notification_settings 저장 (꺼두면 푸시를 보내지 않음, 알림함에는 남음)
 * - 혜택/이벤트(광고성)는 수신 동의 기록 작업과 함께 2차 — readme/todo/push-notification-plan.md
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw redirect("/auth/login");

  const preferences = await getNotificationPreferences(client, user.id);
  return { preferences };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { success: false, error: "로그인이 필요합니다." };

  const formData = await request.formData();
  try {
    await saveNotificationPreferences(client, user.id, {
      orderUpdates: formData.get("orderUpdates") === "true",
      inquiryUpdates: formData.get("inquiryUpdates") === "true",
    });
    return { success: true };
  } catch (error) {
    return actionErrorResponse(error);
  }
};

const ITEMS = [
  {
    key: "orderUpdates",
    label: "주문/배송 알림",
    description: "주문 완료, 상품 발송, 배송 완료, 취소·환불 소식을 알려드려요.",
  },
  {
    key: "inquiryUpdates",
    label: "문의 답변 알림",
    description: "남기신 문의에 답변이 등록되면 알려드려요.",
  },
] as const;

type PrefKey = (typeof ITEMS)[number]["key"];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted/30"
      }`}
      aria-pressed={checked}
      aria-label={`${label} 토글`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/** 기기 알림 권한 — 앱에서만 보인다. 지원 안 하는 이전 빌드면 숨김 */
function DevicePermissionRow() {
  const [state, setState] = useState<PushState | null | "loading">("loading");
  const [busy, setBusy] = useState(false);

  const refresh = () => getPushState().then(setState);

  useEffect(() => {
    refresh();
    // 설정 앱에서 권한을 바꾸고 돌아온 경우를 반영
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  if (state === "loading" || state === null) return null;

  const handleClick = async () => {
    setBusy(true);
    try {
      if (state.status === "denied") {
        await openAppSettingsFromNative();
      } else {
        const next = await enablePush();
        if (next) setState(next);
      }
    } catch {
      /* 무시 */
    } finally {
      setBusy(false);
    }
  };

  const granted = state.status === "granted";

  return (
    <div className="flex items-center justify-between gap-4 py-4 px-4 bg-gray-50">
      <div className="flex flex-col gap-1 flex-1">
        <span className="text-base font-medium">기기 알림</span>
        <span className="text-xs text-muted leading-4">
          {granted
            ? "이 기기에서 알림을 받고 있어요."
            : state.status === "denied"
              ? "기기 설정에서 알림이 꺼져 있어요. 설정에서 KEND 알림을 허용해 주세요."
              : "알림을 켜면 주문·배송 소식을 바로 받아볼 수 있어요."}
        </span>
      </div>
      {granted ? (
        <span className="text-xs font-bold text-primary">켜짐</span>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={busy}
          className="shrink-0 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold disabled:opacity-50"
        >
          {state.status === "denied" ? "설정에서 켜기" : "알림 켜기"}
        </button>
      )}
    </div>
  );
}

export default function NotificationSettingsPage() {
  const { preferences } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [prefs, setPrefs] = useState(preferences);

  const toggle = (key: PrefKey) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    fetcher.submit(
      {
        orderUpdates: String(next.orderUpdates),
        inquiryUpdates: String(next.inquiryUpdates),
      },
      { method: "post" }
    );
  };

  // 저장 실패 시 서버 값으로 되돌림
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.success) {
      setPrefs(preferences);
    }
  }, [fetcher.state, fetcher.data, preferences]);

  return (
    <Content headerPorps={{ title: "알림 설정", useRight: false }}>
      <div className="flex flex-col w-full divide-y divide-muted/10">
        <DevicePermissionRow />
        {ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4 py-4 px-4">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-base font-medium">{item.label}</span>
              <span className="text-xs text-muted leading-4">{item.description}</span>
            </div>
            <Toggle
              checked={prefs[item.key]}
              onChange={() => toggle(item.key)}
              label={item.label}
            />
          </div>
        ))}
        <div className="px-4 py-4">
          <span className="text-xs text-muted/60 leading-4">
            *알림을 꺼도 받은 소식은 알림함에서 확인할 수 있어요.
          </span>
        </div>
      </div>
    </Content>
  );
}
