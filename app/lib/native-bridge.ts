// kend-native WebView 브릿지 클라이언트.
// 웹 -> 네이티브: window.ReactNativeWebView.postMessage(...)
// 네이티브 -> 웹: injectJavaScript로 이 파일이 설치하는 window.__kendNativeBridge.receive
// 콜백을 직접 호출한다 (kend-native/app/index.tsx 참고).

type LocationResult = { lat: number; lng: number };

type PendingEntry = {
  resolve: (value: LocationResult) => void;
  reject: (error: Error) => void;
};

const BRIDGE_TIMEOUT_MS = 8000;
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
      let message: {
        requestId?: string;
        lat?: number;
        lng?: number;
        error?: string;
      };
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
      } else if (
        typeof message.lat === "number" &&
        typeof message.lng === "number"
      ) {
        entry.resolve({ lat: message.lat, lng: message.lng });
      } else {
        entry.reject(new Error("LOCATION_UNAVAILABLE"));
      }
    },
  };
}

/**
 * 네이티브 앱에 현재 GPS 좌표를 요청한다.
 * reject 사유: "NATIVE_UNAVAILABLE"(네이티브 아님/응답 없음),
 * "PERMISSION_DENIED"(위치 권한 거부), "LOCATION_UNAVAILABLE"(OS 레벨 실패)
 */
export function requestLocationFromNative(): Promise<LocationResult> {
  if (!isNativeApp()) {
    return Promise.reject(new Error("NATIVE_UNAVAILABLE"));
  }

  ensureListenerInstalled();
  const requestId = crypto.randomUUID();

  return new Promise<LocationResult>((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error("NATIVE_UNAVAILABLE"));
    }, BRIDGE_TIMEOUT_MS);

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

    window.ReactNativeWebView!.postMessage(
      JSON.stringify({ type: "REQUEST_LOCATION", requestId })
    );
  });
}
