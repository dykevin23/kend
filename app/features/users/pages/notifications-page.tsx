import { useState } from "react";
import Content from "~/common/components/content";

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSetting[] = [
  {
    key: "order",
    label: "주문/배송 알림",
    description: "주문 접수, 발송, 배송 완료 시 알림을 받습니다.",
    enabled: true,
  },
  {
    key: "marketing",
    label: "혜택/이벤트 알림",
    description: "신규 이벤트, 할인 정보를 받아봅니다.",
    enabled: false,
  },
  {
    key: "community",
    label: "활동 알림",
    description: "좋아요, 댓글 등 커뮤니티 활동 알림을 받습니다.",
    enabled: true,
  },
];

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>(DEFAULT_SETTINGS);

  const toggle = (key: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <Content headerPorps={{ title: "알림 설정", useRight: false }}>
      <div className="flex flex-col w-full divide-y divide-muted/10">
        {settings.map((s) => (
          <div
            key={s.key}
            className="flex items-center justify-between gap-4 py-4 px-4"
          >
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-base font-medium">{s.label}</span>
              <span className="text-xs text-muted leading-4">
                {s.description}
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggle(s.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                s.enabled ? "bg-secondary" : "bg-muted/30"
              }`}
              aria-pressed={s.enabled}
              aria-label={`${s.label} 토글`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  s.enabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
        <div className="px-4 py-4">
          <span className="text-xs text-muted/60 leading-4">
            *기기 설정에서 알림 권한이 허용되어야 알림을 받을 수 있습니다.
          </span>
        </div>
      </div>
    </Content>
  );
}
