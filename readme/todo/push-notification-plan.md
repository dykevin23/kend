# 앱 푸시 알림 계획 (주문·배송·문의)

> **목표**: 마이페이지 "알림 설정"이 스위치만 있고 발송 기능이 없는 placeholder 상태(Apple 2.1/5.6 리젝 위험) → 실제로 동작하는 **앱 푸시**로 구현.
> **상태**: 계획 승인 (2026-11-19) — 결정 3건 확정(§4), 착수 대기
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
| 주문 완료 | `order_groups.status` → `paid` | 주문 상세 |
| 상품 발송 | `deliveries.status` → `shipped` (판매자 송장 등록) | 주문 상세 |
| 배송 완료 | `deliveries.status` → `delivered` (배송추적 크론) | 주문 상세 |
| 주문 취소·환불 | `order_groups.status` → `cancelled` / `refunded` / `partially_refunded` | 주문 상세 |
| 반품 완료 | `delivery_items.status` → `returned` | 주문 상세 |
| 문의 답변 | `inquiries.status` `pending` → `answered` (seller) | 문의 상세 |

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

1. **권한 요청 시점**: 첫 주문 완료 화면 + 알림 설정 화면 (첫 로그인 직후 X)
2. **알림함 화면**: **이번에 만든다** (`read_at` 컬럼 포함)
3. **Android**: iOS 완료 후 FCM 설정 추가

## 5. 진행 순서 · 테스트

| 단계 | 내용 | 확인 |
|------|------|------|
| 1 | DB 테이블·트리거 + Edge Function (dev) | SQL로 상태 변경 → `notifications` 생성·발송 기록 |
| 2 | 웹: 브리지·토큰 등록·설정 화면·**알림함** (development) | 개발 서버 |
| 3 | native: expo-notifications + 탭 이동 → **Kend Dev 빌드** | Kend Dev로 실제 푸시 수신 (주문·발송·문의 답변) |
| 4 | prod 적용(마이그레이션·함수) → master 머지 → **운영 앱 빌드** | 운영 앱 수신 확인 |

예상: 1~3단계 3~4일(알림함 포함) + 빌드·실기기 확인.
