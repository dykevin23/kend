# 웹 접근 정책 — 앱 전용 서비스 + 공개 홈페이지

> **목표**: KEND는 앱 전용 서비스. 브라우저(PC·모바일)로 들어오면 **공개 홈페이지(앱 소개 + 다운로드)**로 보내고, 법적 문서·지원 페이지는 누구나 볼 수 있게 한다. Google OAuth 브랜딩 인증(홈페이지 요건)과 App Store 심사(지원 URL·개인정보 URL)를 같이 충족.
> **상태**: 1단계 구현됨(테스트 대기, 2026-11-19) — 홈페이지·공개 고객지원·앱 판별 쿠키
> **범위**: kend(웹)만 — native 수정 불필요(아래 §2)

---

## 1. 현재 상태

| 항목 | 상태 |
|------|------|
| 앱/브라우저 구분 | ❌ 불가 — native가 Google 로그인 차단 회피용으로 **일반 Safari User-Agent**를 씀. 클라이언트에선 `window.ReactNativeWebView`로 알지만 SSR(서버)은 모름 |
| `/` | 비로그인 → `/auth/login` (Google이 홈페이지로 인정 못 함) |
| `/intro` | 공개. "안드로이드 테스트 APK"·"출시 전 단계" 문구, 개인정보처리방침 링크 없음 |
| 공개 경로 | `/auth`, `/terms`, `/privacy`, `/refund-policy`, `/intro` (+ myPage 사본) |
| 지원(고객센터) | `/myPage/support` — **로그인 필요** → App Store 지원 URL로 못 씀 |

## 2. 앱 판별 방법

User-Agent에 앱 표시를 붙이면 Google이 WebView로 판단해 로그인을 막을 위험이 있어 **쿠키**로 판별한다.

- WebView는 문서 로딩 시작 시점에 `window.ReactNativeWebView`를 넣어준다 → root `<head>` 인라인 스크립트(`app/common/constants/app-client.ts`)가 이를 보고 `kend_client=app` 쿠키(1년)를 매 페이지 다시 남김
- 앱 첫 실행처럼 쿠키가 없어 서버가 홈페이지(`/`)를 그린 경우에도, 같은 스크립트가 화면 표시 전에 `/stores`로 이동
- **native 수정 없음 → 기존 빌드 27에서도 동작** (실기기 확인 필요)
- 보안 경계가 아니라 **안내(UX) 장치** — PC에서 쿠키를 직접 넣으면 들어올 수 있지만 문제 없음 (데이터 보호는 RLS 몫)

## 3. 경로 분류

| 구분 | 경로 | 브라우저 접속 시 |
|------|------|------------------|
| **공개 (누구나)** | `/` 홈페이지, `/terms`, `/privacy`, `/refund-policy`, `/support`(신규 공개 지원 페이지) | 그대로 표시 |
| **브라우저 허용 필요** | `/auth/reset-password`, 이메일 인증 링크 (메일 앱에서 Safari로 열림), `/auth/naver/callback`·소셜 콜백, `/payments/*`(Toss 복귀), `/api/cron/*` | 그대로 통과 |
| **앱 전용** | 나머지 전부 (`/stores`, `/products`, `/children`, `/myPage`, `/orders`, `/auth/login`·`/join` …) | `/`(홈페이지)로 이동 |

- `/` 동작: 앱(쿠키 있음) → 로그인 여부에 따라 `/stores` 또는 `/auth/login` / 브라우저 → 홈페이지 표시
- `/intro` → `/`로 영구 이동 (기존 링크 호환)
- `/myPage/terms`·`/myPage/privacy` 등 사본은 그대로 유지 (앱 내부 화면)
- 모바일 브라우저도 PC와 똑같이 처리 (웹은 서비스 대상이 아님)

## 4. 홈페이지 (`/`) 내용

- KEND 로고·이름(Google 동의 화면 앱 이름과 일치), 서비스 소개(현 `/intro` 문구 재사용)
- **다운로드**: App Store 버튼 (출시 전엔 "곧 App Store에서 만나요" 대신 **iOS 출시 예정** 정도로 — "준비 중" 문구 제거). PC에선 QR 코드 함께. Android 버튼은 Android 출시 때 추가 (테스트 APK 링크 제거)
- 하단: **개인정보처리방침 · 이용약관 · 환불정책 · 고객센터** 링크 + 사업자 정보 (통신판매업 번호는 신고증 받으면)
- 반응형: PC 화면에서도 깨지지 않게 (지금 앱 화면은 모바일 폭 전제)

## 5. 개발·테스트 환경

- 로컬·개발 서버(Preview)는 PC 브라우저로 테스트하므로 **환경변수 `APP_ONLY_ACCESS=true`일 때만 차단** → Production에만 켬
- 운영에서 PC로 확인이 필요할 때: 개발자도구에서 `kend_client=app` 쿠키를 넣으면 통과 (내부용)

## 6. 진행 순서

| 단계 | 내용 | 확인 |
|------|------|------|
| 1 | 홈페이지(`/`)·`/support` 공개 페이지, `/intro` 이동, 앱 판별 쿠키, 로그인 후 이동 `/stores` — **차단 없이** | 로컬 curl ✅ / 개발 서버·앱(빌드 27·Kend Dev) 확인 대기 → 운영 배포 → Google 브랜딩 제출 |
| 2 | 앱 전용 차단 로직 (`APP_ONLY_ACCESS`, 꺼둔 채 배포) | 개발 서버에서 env 켜고 PC·앱 동작 확인 |
| 3 | 운영 앱에서 쿠키 확인 후 Production `APP_ONLY_ACCESS=true` | PC 브라우저 → 홈페이지, 앱 → 정상 |
