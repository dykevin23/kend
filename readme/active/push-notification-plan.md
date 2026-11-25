# 앱 푸시 알림 계획 (주문·배송·문의)

> **목표**: 마이페이지 "알림 설정"이 스위치만 있고 발송 기능이 없는 placeholder 상태(Apple 2.1/5.6 리젝 위험) → 실제로 동작하는 **앱 푸시**로 구현.
> **상태**: ✅ iOS 운영 적용·TestFlight 빌드 28 수신 확인 (2026-11-25) — 남은 것: 권한 방식 변경(첫 실행 팝업·상황별 카드) 운영 머지, Android(FCM)
> **범위**: kend(웹) + kend-native(앱) + DB/Edge Function. seller 코드 변경 없음(상태 변경을 DB 트리거가 잡음).
> 결정 배경: 알림톡은 비즈채널·대행사 계약·템플릿 심사·전화번호 수집이 필요해 복잡 → 앱 푸시 먼저(무료, Apple 4.2 네이티브 기능 근거). 알림톡·이메일은 이후 채널 추가로.

---

## 1. 현재 상태

| 항목 | 상태 |
|------|------|
| 알림 설정 화면 (`notifications-page.tsx`) | `useState`만 — 저장 안 됨, 발송 없음. "활동 알림(좋아요·댓글 등 커뮤니티)"은 **없는 기능** |
| native 푸시 | 없음 (`expo-notifications` 미설치) |
| 웹↔native 브리지 (`app/lib/native-bridge.ts`) | `REQUEST_LOCATION` 1종 — 같은 방식으로 토큰 요청 추가 |
| 상태 변경 감지 | `entity_status_history`가 **DB 트리거** 패턴(kend·seller·크론 어디서 바꿔도 잡힘). 알림도 같은 원리 |

## 2. 보낼 알림 (1차)

| 알림 | 감지 (DB 트리거) | 이동할 화면 |
|------|------------------|-------------|
| 주문 완료 `order_paid` | `order_groups.status` `payment_in_progress`/`payment_pending` → `paid` | 주문 상세 |
| 주문 취소 `order_cancelled` | `order_groups.status` `paid`/`partially_refunded` → `cancelled` (구매자 취소·미확인 자동취소. 결제 포기 `failed`는 제외) | 주문 상세 |
| 환불 완료 `order_refunded` | `order_groups.status` → `refunded`(전체) / `partially_refunded`(일부) | 주문 상세 |
| 상품 발송 `order_shipped` | `deliveries.status` → `shipped` (판매자 송장 등록) | 주문 상세 |
| 배송 완료 `order_delivered` | `deliveries.status` → `delivered` (배송추적 크론) | 주문 상세 |
| 반품 승인 `return_approved` | `delivery_items.status` → `returned` (판매자 최종 승인, 환불은 이후 크론 → 환불 완료 알림 별도) | 주문 상세 |
| 문의 답변 `inquiry_answered` | `inquiries.status` `pending` → `answered` (seller) | 문의 상세 |

- 알려진 공백: 여러 판매자 주문 중 **일부 판매자만** 자동취소되는 경우(그룹은 `paid` 유지)는 그룹 단위 알림이 안 나감 — 필요 시 orders 단위 트리거 추가

- **제외(2차)**: 혜택·이벤트(광고성) — 별도 수신 동의 기록·야간(21~08시) 제한·"(광고)" 표기 필요 → 동의 기록 작업과 함께.
- 알림 설정 화면: "주문/배송 알림", "문의 답변 알림"만 노출. "활동 알림" 삭제, "혜택/이벤트"는 2차까지 숨김.

## 3. 구조

```
[상태 변경: kend / seller / 크론]
        │ (DB 트리거)
        ▼
 notifications (발송 대기열 + 알림함)  ──pg_net──▶  Edge Function send-push  ──▶  Expo Push API ──▶ APNs/FCM ──▶ 앱
        ▲                                                  │
        └──── 크론(5분): 실패·미발송 재시도 ◀───────────────┘ (DeviceNotRegistered → 토큰 삭제)
```

### DB (kend 마이그레이션)
| 테이블 | 내용 |
|--------|------|
| `push_tokens` | user_id, token(Expo push token, unique), platform, app_variant(prod/dev), last_seen_at |
| `notification_settings` | user_id(PK), order_updates(기본 true), inquiry_updates(기본 true), marketing(기본 false, 2차), updated_at |
| `notifications` | id, user_id, type, title, body, url, status(pending/sent/failed/skipped), error, created_at, sent_at, **read_at** — 발송 대기열 겸 **앱 내 알림함** |
| 트리거 함수 | 위 6개 상태 변경 시 `notifications` insert (설정 꺼져 있으면 skipped) |

- 발송은 트리거 직후 `pg_net`으로 Edge Function 호출(즉시) + 5분 크론으로 재시도 — 기존 Vault(`project_url`·`secret_key`) 방식 재사용
- dev/prod 각각 같은 마이그레이션. prod DB엔 운영 앱 토큰만, dev DB엔 Kend Dev 토큰만 쌓여 자연스럽게 분리

### Edge Function `send-push` (kend `supabase/functions/`)
- `apikey` secret 키 검사(기존 함수와 같은 방식), `notifications` pending 묶음 → 사용자 토큰 조회 → Expo Push API 전송 → 결과 기록
- 개인정보 최소화: 알림 본문에 이름·주소·전화번호 넣지 않음 (예: "주문하신 상품이 발송되었어요")

### 웹 (kend)
- `native-bridge.ts`: `REQUEST_PUSH_TOKEN` 메시지 추가 → native가 토큰 응답
- 로그인 상태 + 앱에서 접속 시 토큰 등록 액션(`/users/push-tokens`), 로그아웃·탈퇴 시 해당 기기 토큰 삭제
- 알림 설정 화면: `notification_settings` 저장/조회로 교체
- **알림함 화면** (`/notifications`): 받은 알림 목록(최근 순, 90일), 탭하면 `url`로 이동 + `read_at` 기록, 안 읽은 알림 표시(점/배지), 모두 읽음
- **권한 요청 지점**: 첫 주문 완료 화면(결제 성공) 안내 카드 "배송 소식을 알림으로 받아보세요" + 알림 설정 화면 스위치 — 첫 로그인 직후엔 묻지 않음. iOS에서 이미 거절된 경우 "설정 앱에서 켜기" 안내

### native (kend-native) — **새 빌드 필요**
- `expo-notifications` 설치 + 플러그인 (iOS 푸시 권한·APNs 키는 EAS가 관리)
- 웹 요청 시 권한 요청 → Expo push token 발급 → 웹으로 전달
- 알림 탭 → `url`을 WebView에서 열기 (앱이 꺼져 있을 때도)
- Android FCM 설정(`google-services.json`)은 Android 출시 시점에 (iOS 먼저)

## 4. 결정 (2026-11-19 확정)

1. **권한 요청 시점** (11-25 변경): **첫 실행(로그인 상태) 1회 iOS 팝업** + 알림이 꺼져 있으면 **상황별 안내 카드** — 결제 직후 주문 목록("배송 소식…"), 답변 대기 중 문의 상세("답변이 등록되면…"). 미결정이면 팝업, 거부면 설정 앱. 카드 닫기는 이번만 숨김. 알림 설정 화면에서도 언제든
   - 앱 복귀 시마다 권한 재확인 → 설정 앱에서 켜고 돌아온 경우 토큰 등록 (이전엔 실행당 1회라 놓쳤음)
2. **알림함 화면**: **이번에 만든다** (`read_at` 컬럼 포함)
3. **Android**: iOS 완료 후 FCM 설정 추가

## 구현 메모 (1단계)

- 테이블: Drizzle `app/features/notifications/schema.ts` → 마이그레이션 0035 (RLS 켜짐, 본인 행만). `notifications`에 발송 관리용 `attempts`·`claimed_at` 추가
- 트리거·함수·크론: `app/sql/triggers/notifications.sql` (환경마다 psql/SQL Editor로 실행, 재실행 안전)
  - `register_push_token`/`unregister_push_token` RPC (기기 소유자 이전 때문에 SECURITY DEFINER)
  - 알림 트리거는 전부 EXCEPTION으로 감쌈 — 알림 오류가 주문·취소를 실패시키지 않게
  - `claim_pending_notifications` (SKIP LOCKED, service_role만) → 중복 발송 방지
  - 크론 `retry-push-notifications` 5분: 멈춘 건 복구(3회), 24시간 지난 대기 건 failed
- Edge Function `supabase/functions/send-push` (배포 `--use-api`, Docker 불필요)
- dev 테스트(11-20): 트리거 7종 롤백 테스트, 설정 끔 → skipped, 결제 포기 → 알림 없음, 가짜 토큰 → DeviceNotRegistered로 토큰 삭제·no_device, 인증 없는 호출 401
- 남은 것: Expo receipt(최종 전달 결과) 확인은 미구현 — ticket 단계 오류만 처리

## 구현 메모 (2단계 — 웹)

- 화면: 알림함 `/notifications`(목록·읽음·모두 읽음, 90일), 알림 설정 `/myPage/notifications`(기기 권한 + 주문/문의 스위치 저장), 탭 헤더 종 아이콘(안 읽음 점), 마이페이지 메뉴 "알림", 결제 직후 주문목록의 "알림 받기" 카드(권한 미결정일 때만)
- 토큰: 앱 실행 후 로그인 상태면 실행당 1회 재등록(팝업 없음, root), 로그아웃 직전 이 기기 토큰 해제(localStorage에 마지막 토큰 기억), 탈퇴는 FK cascade
- RLS 테스트(11-20, dev, 롤백): 본인 알림만 조회·수정, 남의 설정 저장 차단, 계정 전환 시 토큰 소유자 이동, 일반 사용자 claim 차단

### 웹 ↔ native 브릿지 규약 (3단계 native가 구현할 것)

웹 → native: `postMessage({ type, requestId })` / native → 웹: `window.__kendNativeBridge.receive(JSON.stringify({ requestId, ...결과 }))` (기존 REQUEST_LOCATION과 같은 방식)

| type | 응답 | 동작 |
|------|------|------|
| `GET_PUSH_STATUS` | `{ status, token?, platform }` | 권한 팝업 없이 현재 상태. `granted`면 Expo push token 포함 |
| `REQUEST_PUSH_PERMISSION` | `{ status, token?, platform }` | `undetermined`면 OS 팝업 → 결과. 허용이면 토큰 포함 |
| `OPEN_APP_SETTINGS` | `{ ok: true }` | `Linking.openSettings()` |

- `status`: `granted` / `denied` / `undetermined`, `platform`: `ios` / `android`
- 토큰: `Notifications.getExpoPushTokenAsync({ projectId })` (EAS projectId)
- 알림 탭: `data.url`(앱 내 경로)을 WebView에서 열기 — 앱이 꺼져 있다 켜진 경우(`getLastNotificationResponseAsync`)도
- 앱이 켜져 있을 때 받은 알림도 배너로 표시 (`setNotificationHandler`)
- 이 type을 모르는 이전 빌드는 응답 없음 → 웹은 타임아웃으로 "지원 안 함" 처리(화면 요소 숨김)

## 5. 진행 순서 · 테스트

| 단계 | 내용 | 확인 |
|------|------|------|
| 1 | DB 테이블·트리거 + Edge Function (dev) | ✅ dev 테스트 완료 (11-20) |
| 2 | 웹: 브리지·토큰 등록·설정 화면·**알림함** (development) | 구현됨 — 개발 서버 화면 확인 대기 (푸시 수신은 3단계) |
| 3 | native: expo-notifications + 탭 이동 → **Kend Dev 빌드** | ✅ Kend Dev 수신·탭 이동 확인 (11-24) |
| 4 | prod 적용(마이그레이션·함수) → master 머지 → **운영 앱 빌드** | ✅ 운영 DB·send-push·웹 반영, 빌드 28 TestFlight 수신(앱 켜짐·종료 상태)·탭 이동 확인 (11-25). 운영 주문 트리거는 실주문 시 확인 |

예상: 1~3단계 3~4일(알림함 포함) + 빌드·실기기 확인.
