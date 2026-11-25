/**
 * 앱(WebView) 접속 판별 — readme/active/web-access-policy.md
 *
 * native가 Google 로그인 차단을 피하려고 일반 Safari User-Agent를 쓰기 때문에
 * 서버(SSR)는 User-Agent로 앱/브라우저를 구분할 수 없다.
 * 대신 WebView가 문서 로딩 시작 시점에 넣어주는 window.ReactNativeWebView를
 * <head> 인라인 스크립트에서 확인해 쿠키를 남기고, 이후 요청부터 서버가 쿠키로 판별한다.
 * (native 수정 없이 기존 빌드에서도 동작)
 *
 * 보안 경계가 아니라 안내(UX) 장치 — 데이터 보호는 RLS·인증의 몫.
 */
export const APP_CLIENT_COOKIE = "kend_client";
export const APP_CLIENT_VALUE = "app";

export function isAppRequest(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .some((c) => c.trim() === `${APP_CLIENT_COOKIE}=${APP_CLIENT_VALUE}`);
}

/**
 * 앱이면 쿠키를 (매번) 다시 남기고, 공개 홈페이지(/)로 들어온 경우 바로 앱 첫 화면으로 보낸다.
 * 앱 첫 실행처럼 쿠키가 아직 없어 서버가 홈페이지를 그린 경우에도 화면에 보이기 전에 이동한다.
 */
export const APP_CLIENT_SCRIPT = `(function(){try{if(!window.ReactNativeWebView)return;document.cookie="${APP_CLIENT_COOKIE}=${APP_CLIENT_VALUE}; path=/; max-age=31536000; secure; samesite=lax";if(location.pathname==="/")location.replace("/stores");}catch(e){}})();`;

/**
 * 로그인 없이 열리는 경로 — root loader(서버)와 useAuthListener(클라이언트)가 같이 쓴다.
 * "/"(공개 홈페이지)는 startsWith로 넣으면 모든 경로가 공개되므로 isPublicPath에서 정확히 일치로만 본다.
 */
export const PUBLIC_PATH_PREFIXES = [
  "/auth",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/intro",
  "/support",
  "/myPage/terms",
  "/myPage/privacy",
  "/myPage/refund-policy",
] as const;

export function isPublicPath(pathname: string): boolean {
  return pathname === "/" || PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}
