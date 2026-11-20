// kend-native WebView 브릿지 클라이언트.
// 웹 -> 네이티브: window.ReactNativeWebView.postMessage({ type, requestId })
// 네이티브 -> 웹: injectJavaScript로 이 파일이 설치하는 window.__kendNativeBridge.receive
// 콜백을 직접 호출한다 (kend-native/app/index.tsx 참고). 응답 = { requestId, ...결과 } 또는 { requestId, error }
//
// 요청 종류
// - REQUEST_LOCATION        → { lat, lng }
// - GET_PUSH_STATUS         → { status, token?, platform }  권한 팝업 없이 현재 상태만 (허용이면 토큰 포함)
// - REQUEST_PUSH_PERMISSION → { status, token?, platform }  미결정이면 OS 권한 팝업
// - OPEN_APP_SETTINGS       → { ok: true }                  iOS 설정 앱의 KEND 화면 열기
// 이 요청을 모르는 이전 빌드는 응답하지 않는다 → 타임아웃 = NATIVE_UNAVAILABLE

type BridgeResponse = Record<string, unknown> & { requestId?: string; error?: string };

type PendingEntry = {
  resolve: (value: BridgeResponse) => void;
  reject: (error: Error) => void;
};

const DEFAULT_TIMEOUT_MS = 8000;
const pending = new Map<string, PendingEntry>();

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
    __kendNativeBridge?: { receive: (raw: string) => void };
  }
}

export function isNativeApp(): boolean {
  return typeof window !== "undefined" && !!window.ReactNativeWebView;
}

function ensureListenerInstalled() {
  if (typeof window === "undefined" || window.__kendNativeBridge) return;

  window.__kendNativeBridge = {
    receive(raw: string) {
      let message: BridgeResponse;
      try {
        message = JSON.parse(raw);
      } catch {
        return;
      }
      if (!message.requestId) return;
      const entry = pending.get(message.requestId);
      if (!entry) return;
      pending.delete(message.requestId);

      if (message.error) {
        entry.reject(new Error(message.error));
      } else {
        entry.resolve(message);
      }
    },
  };
}

function requestNative(type: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<BridgeResponse> {
  if (!isNativeApp()) {
    return Promise.reject(new Error("NATIVE_UNAVAILABLE"));
  }

  ensureListenerInstalled();
  const requestId = crypto.randomUUID();

  return new Promise<BridgeResponse>((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error("NATIVE_UNAVAILABLE"));
    }, timeoutMs);

    pending.set(requestId, {
      resolve: (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      },
    });

    window.ReactNativeWebView!.postMessage(JSON.stringify({ type, requestId }));
  });
}

// ---------------------------------------------------------------- 위치

type LocationResult = { lat: number; lng: number };

/**
 * 네이티브 앱에 현재 GPS 좌표를 요청한다.
 * reject 사유: "NATIVE_UNAVAILABLE"(네이티브 아님/응답 없음),
 * "PERMISSION_DENIED"(위치 권한 거부), "LOCATION_UNAVAILABLE"(OS 레벨 실패)
 */
export async function requestLocationFromNative(): Promise<LocationResult> {
  const message = await requestNative("REQUEST_LOCATION");
  if (typeof message.lat === "number" && typeof message.lng === "number") {
    return { lat: message.lat, lng: message.lng };
  }
  throw new Error("LOCATION_UNAVAILABLE");
}

// ---------------------------------------------------------------- 푸시

export type PushPermissionStatus = "granted" | "denied" | "undetermined";

export interface PushState {
  status: PushPermissionStatus;
  token: string | null;
  platform: "ios" | "android";
}

function toPushState(message: BridgeResponse): PushState {
  const status = message.status;
  return {
    status:
      status === "granted" || status === "denied" ? status : "undetermined",
    token: typeof message.token === "string" ? message.token : null,
    platform: message.platform === "android" ? "android" : "ios",
  };
}

/** 권한 팝업 없이 현재 알림 권한 상태(허용이면 토큰 포함). 지원 안 하는 빌드면 NATIVE_UNAVAILABLE */
export async function getPushStateFromNative(): Promise<PushState> {
  return toPushState(await requestNative("GET_PUSH_STATUS", 5000));
}

/** 알림 권한 요청 (미결정이면 OS 팝업). 사용자가 팝업을 보고 있는 동안 기다리므로 타임아웃을 길게 */
export async function requestPushPermissionFromNative(): Promise<PushState> {
  return toPushState(await requestNative("REQUEST_PUSH_PERMISSION", 120000));
}

/** 설정 앱의 KEND 화면 열기 (iOS에서 한 번 거부하면 앱에서 다시 팝업을 띄울 수 없음) */
export async function openAppSettingsFromNative(): Promise<void> {
  await requestNative("OPEN_APP_SETTINGS", 5000);
}
