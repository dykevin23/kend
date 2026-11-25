/**
 * 앱 푸시 토큰 등록/해제 (브라우저 전용 — 이벤트 핸들러·effect에서만 호출)
 *
 * 등록·해제는 사용자 세션으로 DB RPC(register_push_token / unregister_push_token)를 직접 호출한다.
 * 같은 기기에서 계정을 바꾸면 RPC가 토큰 소유자를 새 계정으로 옮긴다.
 * 마지막으로 등록한 토큰은 localStorage에 기억해 로그아웃 때 "이 기기" 토큰만 해제한다.
 */
import { browserClient } from "~/supa-client";
import {
  getPushStateFromNative,
  isNativeApp,
  requestPushPermissionFromNative,
  type PushState,
} from "~/lib/native-bridge";

const TOKEN_STORAGE_KEY = "kend_push_token";
const SYNCED_SESSION_KEY = "kend_push_synced_user";
// 첫 실행 자동 권한 요청을 이미 했는지 (iOS 팝업은 앱당 한 번만 뜨므로 기기에 기억)
const ASKED_KEY = "kend_push_asked";
// 로그인·결제 진행 중에는 팝업을 띄우지 않는다
const NO_PROMPT_PATH = /^\/(auth|payments)(\/|$)/;

const storage = {
  get(key: string, session = false): string | null {
    try {
      return (session ? sessionStorage : localStorage).getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string, session = false) {
    try {
      (session ? sessionStorage : localStorage).setItem(key, value);
    } catch {
      /* 저장 불가 환경은 무시 */
    }
  },
  remove(key: string, session = false) {
    try {
      (session ? sessionStorage : localStorage).removeItem(key);
    } catch {
      /* 무시 */
    }
  },
};

async function registerToken(state: PushState): Promise<void> {
  if (state.status !== "granted" || !state.token) return;
  const { error } = await browserClient.rpc("register_push_token", {
    p_token: state.token,
    p_platform: state.platform,
  });
  if (error) throw error;
  storage.set(TOKEN_STORAGE_KEY, state.token);
}

/**
 * 앱 실행 후 로그인 상태면 한 번:
 * - 아직 한 번도 묻지 않은 기기면 iOS 권한 팝업을 띄운다 (첫 실행 1회 — 이후는 상황별 안내 카드)
 * - 허용된 기기면 토큰을 (재)등록한다 (앱 재설치·토큰 변경·같은 기기 계정 전환 대응)
 */
export async function syncPushToken(userId: string): Promise<void> {
  if (!isNativeApp()) return;
  if (storage.get(SYNCED_SESSION_KEY, true) === userId) return;
  try {
    let state = await getPushStateFromNative();
    if (
      state.status === "undetermined" &&
      !storage.get(ASKED_KEY) &&
      !NO_PROMPT_PATH.test(window.location.pathname)
    ) {
      storage.set(ASKED_KEY, "1");
      // 첫 화면이 다 뜬 뒤에 묻도록 잠깐 기다린다
      await new Promise((resolve) => setTimeout(resolve, 1200));
      state = await requestPushPermissionFromNative();
    }
    await registerToken(state);
    storage.set(SYNCED_SESSION_KEY, userId, true);
  } catch {
    /* 지원 안 하는 이전 빌드·일시 오류 — 다음 실행 때 다시 시도 */
  }
}

/**
 * 앱이 다시 화면에 나타날 때: 설정 앱에서 알림을 켜고 돌아온 경우 토큰을 등록한다 (팝업 없음).
 * 실행당 1회인 syncPushToken만으로는 "설정에서 켜고 복귀"를 놓친다.
 */
export async function refreshPushToken(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    await registerToken(await getPushStateFromNative());
  } catch {
    /* 무시 */
  }
}

/**
 * 알림 권한 요청(미결정이면 OS 팝업) → 허용되면 토큰 등록.
 * 반환: 최종 권한 상태 / 앱이 아니거나 지원 안 하는 빌드면 null
 */
export async function enablePush(): Promise<PushState | null> {
  try {
    const state = await requestPushPermissionFromNative();
    await registerToken(state);
    return state;
  } catch {
    return null;
  }
}

/** 현재 기기 권한 상태 조회 (팝업 없음). 앱이 아니거나 지원 안 하는 빌드면 null */
export async function getPushState(): Promise<PushState | null> {
  if (!isNativeApp()) return null;
  try {
    return await getPushStateFromNative();
  } catch {
    return null;
  }
}

/** 로그아웃 직전: 이 기기 토큰을 해제한다 (세션이 살아 있을 때 호출해야 함) */
export async function unregisterPushToken(): Promise<void> {
  const token = storage.get(TOKEN_STORAGE_KEY);
  storage.remove(SYNCED_SESSION_KEY, true);
  if (!token) return;
  try {
    await browserClient.rpc("unregister_push_token", { p_token: token });
  } catch {
    /* 실패해도 로그아웃은 진행 — 다음 로그인 계정이 등록하면 소유자가 옮겨진다 */
  }
  storage.remove(TOKEN_STORAGE_KEY);
}
