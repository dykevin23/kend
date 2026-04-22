# KEND 출시 전 완성도 강화 로드맵

> **목표**: Happy path만 구현된 현재 상태에서, 실 사용자가 겪을 실패 시나리오를 체계적으로 커버한다.  
> **범위**: KEND 유저 웹앱 (React Router on WebView) + React Native 네이티브 레이어  
> **기간**: 3주

---

## 현재 상태 요약

| 영역 | 상태 | 비고 |
|------|------|------|
| Global ErrorBoundary | ✅ 있음 | `root.tsx` React Router ErrorBoundary — Fallback UI 개선 필요 |
| Alert 시스템 (useAlert) | ✅ 있음 | 모달 기반 Alert/Confirm |
| Toast (sonner) | ⚠️ 설치만 됨 | 패키지 존재하나 `<Toaster />` 미연동 |
| try-catch 패턴 | ⚠️ 부분적 | action에만 산발적 존재, 구조화 안됨 |
| Supabase 에러 매핑 | ❌ 없음 | DB 에러코드 → 한국어 메시지 변환 없음 |
| 폼 Validation (Zod) | ⚠️ 1개 | 주소 폼만 zod 적용 |
| 오프라인 감지 | ❌ 없음 | |
| Auth 토큰 만료 처리 | ❌ 없음 | 세션 만료 시 무응답 |
| 이미지 업로드 검증 | ❌ 없음 | 크기/형식 사전 검증 없음 |
| PostHog 에러 추적 | ❌ 없음 | 패키지 미설치 |
| Edge Function 에러 표준 | ❌ 없음 | `create-naver-user`에 기본 try-catch만 |
| console.log 정리 | ❌ 미정리 | 결제 플로우 등에 디버그 로그 남아있음 |

---

## 전체 우선순위 원칙

1. **충돌 방지 먼저** — 앱이 죽거나 흰 화면이 되는 경우를 최우선으로 막는다.
2. **사용자에게 피드백** — 조용히 실패하지 않는다. 항상 이유를 알려준다.
3. **복구 가능하게** — 에러 발생 시 사용자가 다시 시도하거나 돌아갈 수 있어야 한다.
4. **로그는 출시 전에** — PostHog 에러 이벤트를 연동해서 QA 기간에 검증한다.

---

## Part 1. KEND 웹앱 (React Router)

---

### 1주차 — 기반 다지기

> **핵심 목표**: 에러 구조화 + 인증 안정성 확보 + 알림 체계 정비

---

#### 1-1. 공통 에러 타입 + Supabase 에러 핸들러

**위치**: `app/lib/error-handler.ts` (신규)

**현재 문제**
- action마다 try-catch 패턴이 제각각
- Supabase 에러 객체가 그대로 throw되거나 무시됨
- PostgreSQL constraint 에러(23505, 23503 등)가 "저장에 실패했습니다"로 뭉뚱그려짐

**체크리스트**
- [ ] 공통 에러 타입 `AppError` 인터페이스 정의
- [ ] `parseSupabaseError(error)` — Supabase/PostgreSQL 에러 → `AppError` 변환
- [ ] 주요 PostgreSQL 에러코드 매핑: `23505`(중복), `23503`(참조), `23502`(NOT NULL), `PGRST116`(not found), `42501`(RLS 위반)
- [ ] `actionErrorResponse(error)` — action에서 사용하는 래퍼 함수
- [ ] 기존 action 파일들에 적용 (orders, users, children, payments)

**구현 예시**

```typescript
// app/lib/error-handler.ts
export interface AppError {
  code: string
  message: string
  originalError?: unknown
}

export function parseSupabaseError(error: unknown): AppError {
  if (!error || typeof error !== 'object') {
    return { code: 'UNKNOWN', message: '알 수 없는 오류가 발생했어요.' }
  }
  const err = error as Record<string, unknown>
  if ('code' in err) {
    switch (err.code) {
      case '23505': return { code: 'DUPLICATE', message: '이미 존재하는 데이터예요.', originalError: error }
      case '23503': return { code: 'REFERENCE', message: '연결된 데이터가 없어요.', originalError: error }
      case '23502': return { code: 'NOT_NULL', message: '필수 입력값이 누락됐어요.', originalError: error }
      case 'PGRST116': return { code: 'NOT_FOUND', message: '데이터를 찾을 수 없어요.', originalError: error }
      case '42501': return { code: 'RLS_VIOLATION', message: '접근 권한이 없어요.', originalError: error }
      default: return { code: String(err.code), message: '요청을 처리하지 못했어요.', originalError: error }
    }
  }
  return { code: 'UNKNOWN', message: '알 수 없는 오류가 발생했어요.', originalError: error }
}

export function actionErrorResponse(error: unknown) {
  const appError = parseSupabaseError(error)
  console.error(`[ActionError] ${appError.code}:`, appError.originalError ?? error)
  return { success: false, error: appError.message }
}
```

---

#### 1-2. Auth 토큰 만료 처리

**위치**: `app/hooks/useAuthListener.ts` (신규) + `app/root.tsx`

**현재 문제**
- `root.tsx` loader에서 `auth.getUser()` 실패 시 로그인 redirect는 되지만, 클라이언트 사이드 네비게이션 중 토큰 만료는 감지 못함
- `onAuthStateChange` 리스너 없음
- 세션 만료 시 사용자에게 아무 안내 없이 요청 실패

**체크리스트**
- [ ] `useAuthListener` 훅 — Supabase `onAuthStateChange`로 `SIGNED_OUT` 이벤트 구독
- [ ] `SIGNED_OUT` 이벤트 시 로그인 화면으로 navigate
- [ ] loader/action에서 인증 관련 에러(`JWT expired` 등) 감지 시 로그인 redirect
- [ ] 자동 갱신 실패 시 "로그인이 만료됐어요" alert 표시
- [ ] `root.tsx`에서 `useAuthListener` 호출

---

#### 1-3. Toast(sonner) 연동

**위치**: `app/root.tsx` + 각 action 응답 처리

**현재 문제**
- `sonner` 패키지 설치되어 있으나 `<Toaster />` 미마운트
- 에러/성공 알림에 모달(useAlert)만 사용 중 — 가벼운 알림에는 토스트가 더 적합

**체크리스트**
- [ ] `root.tsx` Layout에 `<Toaster />` 컴포넌트 추가
- [ ] action 에러 시 `toast.error()` 패턴 정립
- [ ] 성공 알림에도 `toast.success()` 활용 (장바구니 추가, 저장 완료 등)
- [ ] 사용 기준 정리:
  - **toast**: 일시적 알림 (에러, 성공, 정보) — 자동 사라짐
  - **useAlert**: 사용자 확인/선택이 필요한 경우 (삭제 확인, 이동 선택 등)

---

#### 1-4. ErrorBoundary Fallback UI 개선

**위치**: `app/root.tsx` (기존 ErrorBoundary 수정)

**현재 상태**: 404/HTTP 에러 분기 + DEV에서 스택트레이스 표시만 있음, 복구 방법 미제공

**체크리스트**
- [ ] Fallback UI: "잠시 문제가 생겼어요" + 재시도 버튼 + 홈으로 버튼
- [ ] 프로덕션에서 스택트레이스 비노출 확인
- [ ] 에러 로깅 포인트 추가 (3주차 PostHog 연동 시 교체)

---

#### 1-5. RLS 전수 점검

**위치**: Supabase Dashboard

**체크리스트**
- [ ] 모든 테이블 RLS 활성화 여부 확인
- [ ] `SELECT` / `INSERT` / `UPDATE` / `DELETE` 정책 누락 확인
- [ ] 본인 데이터만 접근 가능한 정책 적용 (profiles, children, orders 등)
- [ ] `service_role`로 우회해야 하는 작업 목록 분리

**점검 쿼리**
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;

SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public' AND p.tablename IS NULL;
```

---

### 2주차 — 사용자 경험 보완

> **핵심 목표**: 사용자가 "왜 안 되지?" 상태에서 멈추지 않게 한다.

---

#### 2-1. 오프라인 상태 감지 및 UI 표시

**위치**: `app/hooks/useNetworkStatus.ts` (신규) + `app/common/components/offline-banner.tsx` (신규)

**체크리스트**
- [ ] `useNetworkStatus` 훅 — 브라우저 `online`/`offline` 이벤트 기반
- [ ] 오프라인 시 상단 배너 표시 ("인터넷 연결을 확인해주세요")
- [ ] 온라인 복귀 시 배너 자동 해제
- [ ] `root.tsx` Layout에 `<OfflineBanner />` 추가

**구현 예시**

```typescript
// app/hooks/useNetworkStatus.ts
import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

export function useNetworkStatus() {
  const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine)
  return { isOnline }
}
```

---

#### 2-2. 폼 Validation 확대 (Zod)

**위치**: 각 feature의 `schema.validation.ts`

**현재 상태**: 주소 폼(`users/schema.validation.ts`)만 Zod 적용. 나머지 폼은 서버 에러에만 의존.

**방침**: `react-hook-form` 도입 없이, 기존 패턴(useState + action) 유지하면서 **Zod 스키마 + action 단 validation** 강화

**체크리스트**
- [ ] 자녀 등록 폼: 이름(필수, 20자 이하), 생년월일(필수), 성별(필수)
- [ ] 프로필 수정 폼: 닉네임 글자 수 제한
- [ ] 로그인 폼: 이메일 형식, 비밀번호 최소 길이
- [ ] 회원가입 폼: 이메일 형식, 비밀번호 조건, 비밀번호 확인 일치
- [ ] 각 action에서 `safeParse` 후 에러 시 필드별 메시지 반환
- [ ] 클라이언트에서 `useActionData`로 받아 인라인 에러 표시

---

#### 2-3. 이미지 업로드 검증

**위치**: `app/lib/validate-image.ts` (신규) + 기존 업로드 로직 개선

**현재 상태**: `uploadProfileImage()`에 try-catch 있으나 파일 크기/형식 사전 검증 없음

**체크리스트**
- [ ] `validateImageFile(file)` — 크기(5MB 이하), 형식(JPEG/PNG/WebP) 검증
- [ ] 이미지 선택 시점에 검증 → 에러 시 toast 안내
- [ ] Supabase Storage 업로드 실패 시 에러 메시지 분기
- [ ] 업로드 중 로딩 상태 표시

---

#### 2-4. 결제 플로우 에러 처리 강화

**위치**: `app/features/payments/` + `app/features/orders/`

**현재 상태**: 기본 성공/실패 redirect + 배너 표시. 디버그 console.log 남아있음.

**체크리스트**
- [ ] `payment-success-page.tsx`: Confirm API 실패 시 에러 메시지 세분화
- [ ] `payment-fail-page.tsx`: TossPayments 에러코드별 사용자 안내
- [ ] 결제 중 네트워크 끊김 시 처리 (payment_in_progress 복구 안내)
- [ ] 결제 버튼 중복 클릭 방어 강화
- [ ] `product-purchase-modal.tsx`, `order-action.ts` 내 console.log 제거

---

#### 2-5. Edge Function 에러 응답 표준화

**위치**: `supabase/functions/_shared/response.ts` (신규) + 기존 Edge Function

**체크리스트**
- [ ] 공통 응답 헬퍼: `errorResponse(code, message, status)`, `successResponse(data)`
- [ ] `create-naver-user` Edge Function에 적용
- [ ] 향후 Edge Function 추가 시 동일 패턴 적용

---

### 3주차 — 모니터링 연동 + QA

> **핵심 목표**: 출시 후 에러를 추적할 관측 체계 구축 + 시나리오 검증

---

#### 3-1. PostHog 에러 이벤트 연동

**위치**: `app/lib/analytics/error-tracking.ts` (신규)

**체크리스트**
- [ ] `posthog-js` 설치 및 초기화
- [ ] `captureError(error, context)` 헬퍼
- [ ] ErrorBoundary에서 에러 캡처
- [ ] 공통 에러 핸들러에서 주요 에러 자동 캡처
- [ ] 개인정보 필터링 (이름/이메일/전화번호)
- [ ] DEV 환경 비활성화

**추적 이벤트**

| 이벤트명 | 발생 조건 |
|---|---|
| `app_error` | ErrorBoundary 렌더링 에러 |
| `api_error` | Supabase 쿼리 실패 |
| `auth_expired` | 세션 만료 감지 |
| `payment_failed` | 결제 실패 |
| `upload_failed` | 이미지 업로드 실패 |
| `offline_detected` | 네트워크 끊김 |

---

#### 3-2. console.log 전수 정리

**체크리스트**
- [ ] `product-purchase-modal.tsx` 디버그 로그 제거
- [ ] `order-action.ts` 디버그 로그 제거
- [ ] 전체 코드베이스 `console.log` 스캔
- [ ] 유지할 로그는 PostHog 캡처로 전환 또는 조건부 처리

---

#### 3-3. 에러 시나리오 QA 체크리스트

**네트워크**
- [ ] 비행기 모드 → 오프라인 배너 표시 확인
- [ ] 비행기 모드에서 상품 주문 → 에러 토스트 확인
- [ ] 비행기 모드 해제 → 배너 사라짐 + 정상 복구
- [ ] 느린 네트워크 (DevTools 3G) → 로딩/에러 처리

**인증**
- [ ] 세션 강제 만료 → 재로그인 유도 확인
- [ ] 잘못된 이메일/비밀번호 → 명확한 에러 메시지
- [ ] 이미 가입된 이메일 → 중복 안내
- [ ] 소셜 로그인 실패 → 에러 처리

**폼 입력**
- [ ] 필수값 누락 → 에러 메시지 표시
- [ ] 자녀 등록 필드별 검증
- [ ] 배송지 등록 필드별 검증

**결제**
- [ ] 결제 중 앱 이탈 → payment_in_progress 상태
- [ ] 결제 실패 → 실패 배너 + 장바구니 유지
- [ ] 결제 성공 → 장바구니 정리 + 주문내역

**업로드**
- [ ] 5MB 초과 이미지 → 에러 메시지
- [ ] 미지원 형식 → 에러 메시지
- [ ] 업로드 중 네트워크 끊김 → 에러 처리

**PostHog**
- [ ] Staging에서 각 시나리오 재현
- [ ] 대시보드 이벤트 수신 확인
- [ ] 개인정보 미포함 확인

---

## Part 2. React Native 네이티브 레이어

> KEND 웹앱을 WebView로 래핑하는 React Native 앱에서 처리해야 할 항목.
> 웹앱 완성도 작업과 병렬로 진행 가능.

---

### N-1. WebView 로드 에러 처리

**이유**: WebView가 페이지를 로드하지 못하면 사용자에게 빈 화면만 보인다.

**체크리스트**
- [ ] `onError` 핸들러: WebView 로드 실패 시 재시도 UI 표시 ("다시 시도" 버튼)
- [ ] `onHttpError` 핸들러: HTTP 에러(5xx 등) 시 에러 UI
- [ ] 네트워크 미연결 상태에서 WebView 로드 시 오프라인 안내 화면

---

### N-2. WebView ↔ 네이티브 에러 브리지

**이유**: 웹앱 내부에서 발생한 에러를 네이티브 레이어에서 인식하고 대응할 수 있어야 한다.

**체크리스트**
- [ ] 에러 메시지 포맷 정의: `{ type: 'ERROR', payload: { code, message } }`
- [ ] 웹앱에서 `window.ReactNativeWebView.postMessage()`로 에러 전송
- [ ] 네이티브 `onMessage` 핸들러에서 에러 수신 및 처리
- [ ] 에러 유형별 네이티브 대응 (토스트 / 강제 새로고침)

---

### N-3. 네트워크 상태 감지 (네이티브)

**이유**: 브라우저 `navigator.onLine`보다 `@react-native-community/netinfo`가 더 정확하게 네트워크 상태를 감지한다.

**체크리스트**
- [ ] `@react-native-community/netinfo` 설치
- [ ] 네트워크 상태 변경 시 WebView에 주입 (JavaScript injection 또는 postMessage)
- [ ] 웹앱의 `useNetworkStatus` 훅이 네이티브 네트워크 정보도 수신하도록 확장

---

### N-4. 앱 크래시 리포팅

**이유**: 네이티브 레벨 크래시는 웹앱의 ErrorBoundary로 잡을 수 없다.

**체크리스트**
- [ ] 크래시 리포팅 SDK 연동 검토 (Sentry, Firebase Crashlytics 등)
- [ ] WebView를 감싸는 React Native ErrorBoundary 추가
- [ ] uncaught exception 글로벌 핸들러 설정

---

### N-5. 카메라/갤러리 권한 처리

**이유**: RN 앱에서 이미지 선택 시 카메라/갤러리 접근 권한이 필요하며, 거부 시 안내가 필요하다.

**체크리스트**
- [ ] 카메라/갤러리 권한 요청 플로우
- [ ] 권한 거부 시 설정 화면으로 유도하는 알럿
- [ ] iOS/Android 권한 설정 차이 대응

---

## 공통 에러 메시지 가이드

> 작성 원칙: **무슨 일이 생겼는지 + 어떻게 하면 되는지**를 함께 전달한다.

| 상황 | ❌ 나쁜 예 | ✅ 좋은 예 |
|---|---|---|
| 네트워크 에러 | `Network Error` | `인터넷 연결을 확인하고 다시 시도해주세요.` |
| 서버 에러 | `500 Internal Server Error` | `일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.` |
| 중복 데이터 | `Duplicate key value` | `이미 등록된 정보예요.` |
| 권한 없음 | `403 Forbidden` | `접근 권한이 없어요.` |
| 로그인 만료 | `JWT expired` | `로그인이 만료됐어요. 다시 로그인해주세요.` |
| 파일 크기 초과 | `File too large` | `파일 크기는 5MB 이하여야 해요.` |
| 필수값 누락 | `required` | `{필드명}을(를) 입력해주세요.` |
| 결제 실패 | `Payment failed` | `결제에 실패했어요. 결제 수단을 확인하고 다시 시도해주세요.` |

---

*문서 버전: v2.0 | 최초 작성: 2026-03-27 | 수정: 2026-04-01*  
*변경사항: KEND 코드베이스 분석 기반 재구성, 웹앱/네이티브 분리, 우선순위 조정*
