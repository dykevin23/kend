# Kend 출시 마일스톤 보드

> [kend-roadmap-to-launch.md](kend-roadmap-to-launch.md) 기반 실행 트래커.
> 로드맵 = 계획 문서 (안정적) / 본 문서 = 진행 트래킹 (live, 주간 업데이트)
>
> **상위 목표**: 2026년 안 출시
> **내부 타겟**: 2026-09-30 (버퍼를 앞에 두기 위한 tight 스케줄)
> 9월 미달성 시 10~12월로 자연스럽게 이연 가능. 외부 의존성(법인/Toss/NICE)만 지연 없도록 관리.

---

## 🔖 현재 상태 (2026-06-18 기준)

> 4/24 계획 이후 실제 진행을 반영한 요약. 상세는 각 Story 및 하단 체크포인트 로그 참조.

- **🔒 RLS 전무 — 출시 전 하드닝으로 일정화 (6/18 결정)**: 실제 DB ~33개 테이블 전부 RLS 미적용 확정. anon 키가 클라이언트 공개라 RLS 없으면 전 회원 데이터 노출 구조. **단, 현재 실사용자 데이터 없음(미출시) → 긴급도 낮음**으로 판단, 출시 전 하드닝(P4-3)으로 이연. **원래 설계 원칙**([database.md](core/database.md) §64/§105: 접근제어=DB레벨 RLS)이라 계획상 정당한 항목이었으나 미구현 상태였음. ⚠️ 두 가지 단서: ①**공개 배포 URL에 실데이터가 생기면 즉시 재평가** ②켜면 createOrder·browserClient 조회가 깨지므로 **정책 작성·테스트는 막판 아닌 개발단계에서** 미리. 상세 → P1-3 / P4-3

- **계정/인증 트랙 정리 완료**
  - ✅ **이메일 기반 비밀번호 재설정** 구현 (`/auth/find-password` → `/auth/reset-password`, token_hash 방식 포함). 로그인/재설정 UX 수정 완료
  - ❌ **휴대폰 SMS 인증 → 출시 후로 이연 결정 (6/17)**. 전체 구현은 `feature/phone-auth` 브랜치(commit d6ec2b0)에 보존, kend-newbuild 미반영. → EXT-2(SMS 벤더)도 출시 후로 보류
  - ⏸ 아이디 찾기 제거 / 소셜 추가정보 flow → 휴대폰 인증과 함께 출시 후로 이연
- **iOS swipe back**: clientLoader 캐시 부분 적용(`/stores`, `/stores/:storeId`), 나머지 라우트 rollout + 네이티브 swipe blacklist 적용은 잔여
- **주문/결제 도메인 — 보드 정정**: 4/24 보드는 "미착수"로 적었으나 **코드 확인 결과 거의 구현됨**. 주문 스키마 전체 + 주문 생성 + TossPayments Confirm API + 결제 success/fail 페이지 + 결제 위젯까지 존재. **결제는 코딩이 아니라 `PAYMENT_COMING_SOON` 플래그 해제 + Toss 키(EXT-3) + 실테스트가 남은 것.** 미구현은 환불/취소 실행 로직·구매확정(P1-5 일부)
- **🚨 iOS 심사 2달+ 정체**: 1달 전 문의에도 "곧 처리" 답변만 받고 진척 없음. App Store Connect 상태/Resolution Center 확인 → escalate(전화 콜백) → 빌드 리셋 재제출 순으로 대응 필요. **개발은 병렬로 계속**
- **❓ 확인 필요**: P0-3(에러 핸들링) 일부 — 오프라인 감지·PostHog·WebView 브리지 미구현(상세는 P0-3 항목)

---

## 사용법

### Story / Sub-task 구조
- **Story**: 큰 단위 작업 (3~8일 분량). 사전 정의.
- **Sub-task**: 각 Story 착수 시점에 체크리스트로 추가. 현재 컨텍스트 기준으로 그때그때 쪼갬.

### 상태 표기
- 🟡 **Todo** — 착수 전
- 🟢 **In Progress** — 진행 중
- ⏸ **Holding** — 외부 의존성 대기 / 의사결정 대기
- ✅ **Done** — 완료
- ❌ **Dropped** — 출시 후로 이연 결정

### 운영 규칙
- 매주 금요일 진행 점검 → 지연 발생 시 다음 주 월요일 계획 조정
- Story 착수 직전: Sub-task 체크리스트 추가
- Phase 진입 게이트마다 선택 항목 포함/드롭 결정

---

## 주요 마일스톤

| Phase | 종료 목표일 | 주요 내용 |
|-------|-----------|----------|
| Phase 0 | **2026-05-01 (금)** | iOS 심사 통과, 잔여 마무리 |
| Phase 1 | **2026-05-29 (금)** | 휴대폰 인증, 결제+주문 도메인 |
| Phase 2 (필수) | **2026-07-01 (수)** | 주문/배송/재고/유저 화면/배송비 |
| Phase 3 | **2026-07-17 (금)** | 정산 시스템 |
| Phase 2 (선택) | **2026-08-07 (금)** | Seller 편의 기능 — Phase 4 진입 시 재평가 |
| Phase 4 | **2026-08-07 (금)** | 환경 분리, 통합 QA, 실운영 전환 |
| Phase 5 (개발) | **2026-09-04 (금)** | 디자인 수정 반영 + 회귀 테스트 |
| 스토어 제출 | **2026-09-07 (월)** | 심사 2~3주 버퍼 |
| 🚀 **출시** | **2026-09-28 ~ 09-30** | 내부 타겟. 지연 시 연내 출시 범위에서 조정 |

> ⚠️ **디자인 시안 수령 협의 필요**: 로드맵은 9월 초중순 수령 가정이지만, 9월 말 출시 타겟이면 **8월 초**까지 당겨져야 함. 대표와 일정 조율 필요.

---

## 외부 의존성 트랙 (병렬 진행)

> 내부 개발과 별개로 시간이 드는 항목. 조기에 걸어두지 않으면 막힘.

| ID | 항목 | 상태 | Due | 비고 |
|----|------|------|-----|------|
| EXT-1 | 법인 설립 (+ 통신판매업 신고 동시 위임) | ⏸ Holding | **2026-06-05** | 대표 진행, 법무사 지인 소개. Phase 1 완료 시점 Due |
| EXT-2 | SMS 벤더 선택 (알리고 vs NHN Cloud) | ⏸ Holding (출시 후) | — | 휴대폰 인증 출시 후 이연(6/17)에 따라 함께 보류 |
| EXT-3 | TossPayments 개발자 계정 + 테스트 키 | 🔴 Todo (블로커化) | **지연** | ★ 결제(P1-4)가 코드상 거의 완성 → **테스트 키만 있으면 E2E 검증 가능**. 발급 우선순위 최상 |
| EXT-4 | 스마트택배 API 신청 | 🟡 Todo | **2026-06-01** | 영업일 단위 발급, Phase 2 전 |
| EXT-5 | TossPayments 실키 전환 신청 | ⏸ Holding | **2026-07-03** (심사 완료) | **법인 완료 당일 신청 ★** 심사 2~4주 |
| EXT-6 | NICE 본인확인 계약 | ⏸ Holding | **2026-07-20** | 법인 직후 신청, Phase 4 전 완료 |

> 📌 Toss 심사 대비 체크리스트: [tosspayments-review-checklist.md](tosspayments-review-checklist.md)

---

## 보드

### Phase 0 — 잔여 마무리 (2026-04-27 ~ 2026-05-01)

#### 🚨 P0-1. iOS 심사 — **2달+ 정체 (블로커, 진행 중)**
- **Due**: 2026-05-01 → **미해결**
- **우선순위**: 🔴 블로커
- **상황**: 결제 "서비스 준비 중" 처리 후 재제출했으나 **2개월 넘게 심사 정체**. 1달 전 문의에도 "곧 처리" 답변만 받고 진척 없음
- **대응 트랙**:
  - [ ] App Store Connect 상태 확인 — 진짜 "심사 중"인지 / Resolution Center에 미확인 메시지(우리 회신 대기) 있는지
  - [ ] Apple Developer Support **전화 콜백 예약** + 기존 케이스 escalate (expedite 약속 미이행 명시)
  - [ ] 막판 카드: 제출 취소 후 **새 빌드 재제출**로 큐 리셋 (단, 위 회신 대기 여부 먼저 확인)
- **참고**: [ios-review-rejection-apr14.md](active/ios-review-rejection-apr14.md)
- **note**: 심사 정체는 **출시(release)만 막고 개발은 막지 않음** → 개발 병렬 진행

#### 🟢 P0-2. 1차 내부 테스트 잔여 처리 (대부분 완료, swipe rollout 잔여)
- **Due**: 2026-05-01 (일부 잔여 진행 중)
- **참고**: [internal-test-1st.md](active/internal-test-1st.md)
- **포함**: 스와이프 뒤로가기 UX 개선, 네이티브 스와이프 차단 URL blacklist 적용
- **제외**: 휴대폰 인증 연계 2건 (→ Phase 1에서 통합)
- **Sub-task**:
  - [x] Cache-Control 정책 조정 — [app/entry.server.tsx](../app/entry.server.tsx) (`/auth`, `/payments`, `/children` 민감 경로 `no-store` / 그 외 `private, max-age=60`)
  - [x] iOS 실기기 swipe back 진단 (가설: bfcache 미작동 → 결과: **bfcache가 아닌 React Router single fetch의 loader 재실행**이 원인)
  - [x] `clientLoader` 캐시 헬퍼 도입 + `/stores`, `/stores/:storeId` 2개 라우트 적용 → swipe back 시 loader 단계 없이 즉시 복귀 확인
  - [ ] **나머지 라우트로 펼치기** (저위험 일괄 + 고위험 invalidation 인프라) → [client-loader-cache-rollout](todo/client-loader-cache-rollout.md)
  - [ ] 네이티브 스와이프 차단 URL blacklist 최종 적용

#### 🟢 P0-3. 에러 핸들링 — Week 1 완료, Week 2-3 일부 잔여
- **Due**: 2026-05-01 (잔여 진행 중)
- **참고**: [kend-error-handling-roadmap.md](todo/kend-error-handling-roadmap.md)
- **✅ 구현됨**: 공통 에러 핸들러 `app/lib/error-handler.ts`(`parseSupabaseError` 10개 파일 적용) · Auth 만료 `useAuthListener.ts` · Toast(`<Toaster/>` 마운트) · 이미지 검증 `validate-image.ts`
- **❌ 잔여 Sub-task**:
  - [ ] **오프라인 감지** — `useNetworkStatus` 훅 + `offline-banner` (← 다음 착수 후보, 자기완결·외부의존 없음)
  - [ ] PostHog 에러 추적 (패키지 미설치) — QA(Phase 4) 전까지면 됨
  - [ ] Edge Function 응답 표준화 `_shared/response.ts`
  - [ ] console.log 정리 (order-action 등 디버그 로그 잔존)
  - [ ] WebView 에러 브리지 (N-2, kend-native 연동 필요)
  - [ ] 폼 validation 표준화 → [form-validation-standard.md](todo/form-validation-standard.md)로 분리

---

### Phase 1 — 핵심 기반 (2026-05-04 ~ 2026-05-29)

#### ❌ P1-1. 휴대폰 인증 SMS OTP 연동 — **출시 후로 이연 (2026-06-17 결정)**
- **결정 배경**: SMS OTP는 본인인증(NICE)이 아니라 번호 점유 확인일 뿐 → MVP 블로커 아님. 계정 복구는 이메일 재설정으로 대체
- **코드 보존**: 전체 구현(게이트/OTP Edge Function/추가정보/아이디·비번 찾기/번호 중복방지/트리거)을 `feature/phone-auth` 브랜치(commit d6ec2b0)에 보존. kend-newbuild 미반영
- **재개 시**: 브랜치 병합 → 마이그레이션(0016/0017) + Edge Function 배포 + SMS 벤더 확정 + RLS
- **참고**: [phone-auth-plan.md](todo/phone-auth-plan.md) (상단 보류 배너)

#### ✅ P1-2. 계정 복구 flow — **이메일 재설정으로 대체 완료 (2026-06-17)**
- **완료**: 이메일 기반 비밀번호 재설정(`/auth/find-password` → `/auth/reset-password`, token_hash 방식 포함), 계정 열거 방지, 로그인/재설정 UX 수정
- **제거**: 아이디 찾기 (본인 인증 수단 없이 이메일 반환 불가 → 기능 제외, 404 링크 정리)
- **이연**: 소셜 추가정보 입력 flow, 기존 회원 휴대폰 번호 보강 → 휴대폰 인증(P1-1)과 함께 출시 후로
- **잔여 todo**: 폼 validation 표준화 [form-validation-standard.md](todo/form-validation-standard.md)

> 📌 **P1-3~P1-5는 코드 확인 결과 대부분 구현됨 (2026-06-18 정정).** 4/24 보드의 "미착수"는 오류. 남은 핵심은 **결제 플래그 해제 + Toss 키(EXT-3) + 실테스트**, 그리고 환불/취소 실행 로직.

#### 🟡 P1-3. 주문 도메인 DB 설계 — **테이블 ✅ / RLS·인덱스·배치 ❌ (정정 2026-06-18)**
- **✅ 완료**: [orders/schema.ts](../app/features/orders/schema.ts)에 order_groups · payments · orders · order_items · deliveries · delivery_items + 상태 enum 전체. 마이그레이션 적용됨. 상태 머신(enum) 정의 포함
- **🔒 누락 — RLS 정책 → 출시 전 하드닝(P4-3)으로 이연 (6/18 결정)**: 로드맵 P1-3 "RLS 정책 설계" + [database.md](../core/database.md) §64/§105가 명시했으나 미구현. **범위는 주문 도메인이 아니라 DB 전체 ~33개 테이블**(profiles·children·carts·product_*·seller_* 등 kend/seller 공유). 실데이터 없어 긴급도 낮음 → 출시 전 적용. 정책 작성·테스트는 개발단계에서 선행(막판 금지)
- **🟡 누락 — 인덱스**: 설계 문서 §11이 명시한 인덱스(user_id/status/created_at/tracking 등)가 schema.ts에 미정의 → 마이그레이션에도 없음. 주문 조회 성능
- **🟡 누락 — 배치**: 설계 §9.2/§10의 `payment_in_progress` → `failed` 미응답 정리 배치(cron) 미구현 → 미완료 주문 적체 위험
- **연계**: RLS는 P0-3의 "RLS 전수 점검"과 묶어서 처리

#### 🟢 P1-4. TossPayments 결제창 + 주문-결제 트랜잭션 — **거의 완료 (차단/테스트만 남음)**
- **Due**: 2026-05-22
- **우선순위**: 🔴 최우선
- **선행**: EXT-3 (Toss 테스트 키) ← **실제 남은 블로커**
- **✅ 구현됨**: 주문 생성 [order-action.ts](../app/features/orders/pages/order-action.ts) · TossPayments Confirm API [payments/mutations.server.ts](../app/features/payments/pages/mutations.server.ts) · 결제 success/fail 페이지 · 결제 위젯([product-purchase-modal.tsx](../app/features/products/components/product-purchase-modal.tsx))
- **❌ 남은 일**:
  - [ ] `PAYMENT_COMING_SOON = true` 플래그 해제 (현재 결제 차단 중)
  - [ ] EXT-3 Toss 테스트 키 발급 → 실제 결제 플로우 E2E 테스트
  - [ ] 웹훅 처리 확인 (구현 여부 미검증)
  - [ ] console.log 정리 (order-action 디버그 로그)

#### 🟡 P1-5. 결제 환불/취소 + 조회 UI + 차단 플래그 — **부분 구현**
- **Due**: 2026-05-29
- **선행**: P1-4
- **✅ 구현됨**: 주문 내역 조회 UI([orders-page.tsx](../app/features/orders/pages/orders-page.tsx) 상태탭 포함) · 차단 플래그(`PAYMENT_COMING_SOON`)
- **❌ 미구현**: 결제 취소/환불 실행 로직(Toss cancel API·mutation 없음) · 구매확정 · 이중결제 방지 확인
- **Sub-task**: (착수 시 추가)

---

### Phase 2 필수 — 주문/배송/재고 (2026-06-01 ~ 2026-07-01)

> ⚠️ P2-1이 선행되어야 이후 테스트 가능.
> 📌 **DB 레이어는 이미 존재**: deliveries · delivery_items(부분취소/교환 단위) · courier/tracking_number · 배송비 타입 enum 등이 [orders/schema.ts](../app/features/orders/schema.ts)에 정의됨. P2-2~P2-6은 주로 **Seller/유저 화면(UI) 작업** (kend-seller 포함).

#### 🟡 P2-1. Kend-Seller 판매자 기반 (선행 필수)
- **Due**: 2026-06-05
- **우선순위**: 🔴 선행 필수
- **포함**: 판매자 로그인/인증, 업체 등록+승인 flow, 프로필/사업자 정보 관리
- **Sub-task**: (착수 시 추가)

#### 🟡 P2-2. Kend-Seller 주문 관리 화면 **[필수]**
- **Due**: 2026-06-12
- **포함**: 주문 목록/상세, 상태 변경 액션, 대량 일괄 처리, 신규 주문 알림
- **Sub-task**: (착수 시 추가)

#### 🟡 P2-3. 배송 처리 **[필수]**
- **Due**: 2026-06-19
- **선행**: EXT-4 (스마트택배 API)
- **포함**: 배송사+송장번호 UI, 배송 추적 연동, Kend 유저 배송 현황
- **Sub-task**: (착수 시 추가)

#### 🟡 P2-4. 재고 차감 연동 **[필수]**
- **Due**: 2026-06-23
- **포함**: 자동 차감, 품절 처리, 취소 복구, 재고 부족 알림
- **Sub-task**: (착수 시 추가)

#### 🟡 P2-5. Kend 유저 앱 주문 관련 화면 **[필수]**
- **Due**: 2026-06-30
- **포함**: 주문 내역 목록/상세(배송 추적), 주문 취소, 구매확정 버튼
- **Sub-task**: (착수 시 추가)

#### 🟡 P2-6. 배송비 설정 **[필수]**
- **Due**: 2026-07-01 (P2-5와 병행)
- **포함**: 무료/유료/조건부 무료 설정
- **Sub-task**: (착수 시 추가)

---

### Phase 3 — 정산 시스템 (2026-07-02 ~ 2026-07-17)

#### 🟡 P3-1. 구매확정 로직
- **Due**: 2026-07-06
- **포함**: 수동 확정, 자동 확정 cron, 상태 잠금
- **Sub-task**: (착수 시 추가)

#### 🟡 P3-2. 정산 계좌 등록
- **Due**: 2026-07-08
- **선행**: EXT-1 (법인 완료 → 실계좌)
- **포함**: 정산 계좌 등록 UI, 1원 인증
- **Sub-task**: (착수 시 추가)

#### 🟡 P3-3. 정산 계산 배치
- **Due**: 2026-07-14
- **포함**: settlement_items 테이블, 정산 항목 생성 cron, 수수료 차감, 주기 설정
- **Sub-task**: (착수 시 추가)

#### 🟡 P3-4. 정산 내역 조회
- **Due**: 2026-07-17
- **포함**: 내역 목록(기간 필터), 주문별 명세, 엑셀 다운로드
- **Sub-task**: (착수 시 추가)

---

### Phase 2 선택 — Seller 편의 기능 (2026-07-20 ~ 2026-08-07, **드롭 가능**)

> 🚦 **게이트 결정**: Phase 4 진입(2026-07-20)에 실제 잔여 시간 보고 포함/드롭 결정.
> 드롭 시 관리자 수동 처리 + Supabase 콘솔 + 이메일/SMS로 대체.

#### ⏸ P2-7. Seller 상품 관리 보완 [선택]
- **Due**: 2026-07-24 (포함 시)
- **포함**: 옵션 관리, 일괄 관리, 카테고리/태그, 이미지 다중 업로드
- **드롭 시 대체**: 초기 단일 옵션, 단건 처리, 기본 카테고리

#### ⏸ P2-8. Seller 대시보드 + 알림 센터 [선택]
- **Due**: 2026-07-29 (포함 시)
- **드롭 시 대체**: Supabase 콘솔 주간 확인 + 이메일/SMS 알림

#### ⏸ P2-9. 반품/환불 처리 UI [선택]
- **Due**: 2026-07-31 (포함 시)
- **⚠️ 드롭 시에도 필수**: 관리자 수동 처리 SOP 문서 작성 (전자상거래법 대응)

#### ⏸ P2-10. CS 관리 + 리뷰 관리 [선택]
- **Due**: 2026-08-07 (포함 시)
- **드롭 시 대체**: 카카오채널/이메일 CS, 리뷰 신고는 관리자 수동

---

### Phase 4 — 환경 분리 + 통합 QA (2026-07-20 ~ 2026-08-07)

#### 🟡 P4-0. 선택 항목 포함/드롭 결정 게이트
- **Due**: 2026-07-20
- **액션**: P2-7~10 진행 상태 판단, 미완은 출시 후 이연 결정

#### 🟡 P4-1. Supabase dev/prod 환경 분리
- **Due**: 2026-07-24
- **참고**: [environment-separation-plan.md](active/environment-separation-plan.md)
- **Sub-task**: (착수 시 추가)

#### 🟡 P4-2. 통합 QA
- **Due**: 2026-08-05
- **포함**: B2C 전체 루프, 엣지 케이스, iOS/Android 디바이스 QA, Seller 플로우
- **Sub-task**: (착수 시 추가)

#### 🟡 P4-3. 실운영 전환 체크리스트
- **Due**: 2026-08-07
- **선행**: EXT-5, EXT-6 완료
- **포함**: 실키 전환, NICE 실서비스, Supabase prod 확인, 도메인/SSL, PostHog 프로덕션, 1호 판매자 온보딩, 차단 플래그 테스트, 무결성 쿼리, 약관 최신화
  - **🔒 전체 테이블 RLS 적용·검증** (~33개, kend/seller 공유 DB라 seller 조율 필요). 전수점검 쿼리는 [error-handling-roadmap](todo/kend-error-handling-roadmap.md) 1-5. **정책 작성은 이 단계 전 개발기간에 선행**(켜면 createOrder 등 깨지므로 테스트 버퍼 필수)
- **참고**: [tosspayments-review-checklist.md](tosspayments-review-checklist.md)
- **Sub-task**: (착수 시 추가)

---

### Phase 5 — 디자인 대응 + 출시 (2026-08-10 ~ 2026-09-30)

#### ⏸ P5-1. 디자인 시안 검토 및 수정 반영
- **Due**: 2026-08-28
- **상태**: Holding (디자인 시안 수령 대기)
- **⚠️ 전제**: 시안 수령이 **8월 초**까지여야 9월 말 출시 가능. 대표와 일정 조율 필수.
- **Sub-task**: (시안 수령 후 추가)

#### 🟡 P5-2. 회귀 테스트
- **Due**: 2026-09-04
- **선행**: P5-1

#### 🟡 P5-3. 스토어 제출 및 심사 대응
- **Due**: 2026-09-07 (제출), ~09-21 (승인 예상)
- **선행**: P5-2

#### 🟡 P5-4. 🚀 출시
- **Due**: 2026-09-28 ~ 2026-09-30
- **선행**: 심사 승인
- **지연 시**: 10월로 이연, 연내 출시 범위에서 조정

---

## 주간 체크포인트 로그

> 매주 금요일 진행 점검 결과 기록.

### 2026-04-24 (금) — 계획 수립
- 로드맵 확정, 마일스톤 보드 생성
- Toss 심사 대비 체크리스트 별도 작성
- 다음 주(4/27)부터 Phase 0 본격 착수
- **P0-2 착수**: `app/entry.server.tsx` Cache-Control 정책 조정 완료 → 프리뷰 배포 + iOS 실기기 검증 남음

### 2026-06-18 (목) — 보드 현실화 + 코드 실측 정정
- **계정/인증 트랙 정리 반영**: 휴대폰 인증(P1-1) 출시 후 이연 결정(6/17), 이메일 비밀번호 재설정으로 P1-2 대체 완료, 아이디 찾기 제거. EXT-2(SMS 벤더)도 함께 보류
- **🔧 코드 실측으로 보드 대폭 정정**:
  - **P1-3 주문 DB 설계 → 🟡 테이블만 완료**: 스키마/마이그레이션은 있으나 **RLS 정책(🔴 보안 블로커)·인덱스·결제 미응답 배치 누락** 발견. RLS는 대시보드 적용 여부 우선 확인 필요
  - **P1-4 결제 → 🟢 거의 완료** (주문생성+Toss Confirm API+success/fail+위젯). 남은 건 플래그 해제·**EXT-3 Toss 키**·E2E 테스트
  - **P1-5 → 🟡 부분** (조회 UI 있음, 환불/취소 실행·구매확정 미구현)
  - **P0-3 → 🟢 Week 1 완료** (error-handler·useAuthListener·Toast·이미지검증). 잔여: 오프라인 감지·PostHog·WebView 브리지·console.log 정리
  - Phase 2 배송/재고 **DB 레이어 이미 존재** (deliveries/delivery_items 등)
- **🚨 P0-1 iOS 심사 2달+ 정체 확인** (사용자 제보): 1달 전 문의에도 "곧 처리"만. 확인→escalate→재제출 트랙으로 대응, 개발은 병렬 진행
- **오늘 작업 결정**: 외부 의존성 없는 **P0-3 오프라인 감지**부터 착수 (결제는 Toss 키 대기라 오늘 단독 완결 불가)
- **EXT-3 Toss 테스트 키**: 결제 완성의 실질 블로커로 부상 → 발급 우선순위 ↑

---

*최종 업데이트: 2026-06-18*
