# KEND 프로젝트 현재 상황 (Overview)

> 최종 업데이트: 2026-08-21
> 프로젝트 현재 상태를 한눈에 보는 **단일 대시보드**. 개발 진행마다 갱신한다.
> 완료 상세 → [changelog-kend.md](./changelog-kend.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md) / Phase 트래킹 → [kend-milestones.md](./kend-milestones.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND** — 자녀 성장정보 기반 유아용품 추천/거래 플랫폼. React Native WebView(앱) + React Router 웹앱(kend) + 판매자 관리자 웹(kend-seller), 단일 Supabase DB 구조. 현재 **MVP 출시 준비** 단계.

---

## 🚦 지금 상황 (2026-08-21)

- 🚨 **iOS App Store 심사 3달+ 정체** — 문의에도 "곧 처리"만. ASC 상태/Resolution Center 확인 → escalate → 빌드 리셋 재제출 트랙. **개발은 병렬 진행**
- 🎉 **법인 설립·법인 계좌 완료** → 결제/정산 외부 의존성 해소. **TossPayments 실키 신청 완료(심사 대기)**. NICE는 Holding(본인확인 불필요 방향)
- ✅ **결제 도메인 실질 완성**: 결제 E2E + 주문 취소·전액 환불(P1-5) 모두 테스트 키로 동작 확인. `PAYMENT_COMING_SOON=true`로 차단 중
- ✅ **Phase 2.5 — P2.5-1(SLA)·P2.5-2(구매확정)·P2.5-5(플랫폼 조건부 무료배송) 완료**
- ✅ **P2.5-3(반품) — kend+kend-seller 통합 E2E 검증 완료**: 반품 신청→1차승인→회수확인→최종승인→Toss 부분환불·재고복원 전 구간 실제 데이터로 검증(정상 플로우 14단계 + 예외 케이스 8종 전부 통과). 검증 중 발견한 UI/로직 버그 6건 전부 수정 + 주문/배송 탭을 상품(delivery_item) 단위로 재정의(전체/주문접수/배송중/배송완료/취소·환불). 교환(exchange)은 정책 미정 항목 많아 별도 스텝으로 미룸
- ✅ **구매확정을 상품(delivery_item) 단위로 개별화 완료**: `orders.purchase_confirmed_at` → `delivery_items.purchase_confirmed_at`로 이전(마이그레이션 적용 완료). 한 주문에 정상+반품 상품 섞여도 정상 상품만 구매확정 가능해짐, 실사용 테스트 확인 완료
- ✅ **P2.5-4(문의하기) kend 부분 완료**: `inquiries` 테이블 신규(카테고리별 단일질문+단일답변 Q&A). 연결 대상은 `order_group_id`가 아니라 `order_item_id`로 설계(판매자를 항상 유일하게 특정하기 위함, `order_items.order_id → orders.seller_id`). 작성폼은 "관련 주문→상품" 2단계 계층 선택. **kend-seller 처리화면(답변 작성)은 스코프 밖** — seller 완료 전까지 문의는 전부 답변대기로 남음
- ⚠️ **반품 정책 법률 검토 필요 발견**: 반품 사유 자가신고(증빙 없음) + 반품배송비 부담주체 미구현 + 판매자귀책 사유 반품기간이 전자상거래법 법정기준보다 짧을 가능성 — 상세는 [order-cancel-refund-exchange-flow.md §5-4](./todo/order-cancel-refund-exchange-flow.md). **Toss 실키 전환 전 법률 검토 권장**
- 📌 **배송조회 상세 이력(택배사 단계별 이력) 화면은 백로그로 보류**: 스마트택배 API에 데이터는 있으나 kend-seller `sync-tracking`이 현재 안 읽고 있음, Phase 미배정 상태로 기록만 해둠
- **다음 개발 후보**: P2.5-3 교환 → `.server.ts` 시크릿 노출 감사 / P0-3 잔여 (kend 쪽 Phase 2.5 핵심 항목은 이걸로 소진, 남은 건 kend-seller의 P2.5-4 처리화면·P2.5-6 RTS)

---

## ✅ 최근 완료

- 2026-08-21: **P2.5-4(문의하기) kend 부분 완료** — 카테고리별 문의 작성/목록/상세, 주문→상품 2단계 선택. kend-seller 처리화면은 별도 ✅
- 2026-08-21: **구매확정 상품(delivery_item) 단위 개별화 완료** — `orders`→`delivery_items` 컬럼 이전, 정상+반품 상품 섞인 주문에서 정상 상품만 구매확정되는지 실사용 테스트 확인 ✅
- 2026-08-21: **P2.5-3(반품) kend+kend-seller 통합 E2E 검증 완료** — 정상 플로우 14단계 + 예외 케이스 8종 전부 실제 데이터로 통과. 발견된 UI/로직 버그 6건 수정, 주문/배송 탭 상품 단위 재정의 ✅

> 상세: [changelog-kend.md](./changelog-kend.md)

---

## 🔄 진행 중 / 대기 (active)

| 항목 | 상태 |
|------|------|
| [ios-review-rejection-apr14](./active/ios-review-rejection-apr14.md) | 🚨 심사 정체 → escalate 필요 |
| [internal-test-1st](./active/internal-test-1st.md) | 15/18 완료, 잔여는 휴대폰 인증 연계(이연) |
| [native-swipe-blacklist](./active/native-swipe-blacklist.md) | 네이티브 적용 대기 |
| [environment-separation-plan](./active/environment-separation-plan.md) | 출시 전 필수, 미착수 |
| [order-lifecycle-master-plan](./todo/order-lifecycle-master-plan.md) | Phase 2.5 진행 중 — P2.5-1/2/5 완료, P2.5-3(반품) E2E 검증 완료, P2.5-4(문의) kend 부분 완료. 교환은 별도 스텝, P2.5-4 seller 처리화면·P2.5-6은 kend-seller 담당 |

---

## 📋 다음 작업

| 항목 | 우선순위 | 비고 |
|------|---------|------|
| **P2.5-3 교환(exchange)** | **다음** | 정책 미정 항목 다수(옵션재고 없을때 처리, 배송비 부담주체, 횟수제한 등) — 착수 전 정책 결정 필요 |
| 반품 정책 법률 검토 (전자상거래법) | 실키 전환 전 | 사유 자가신고 검증·배송비 부담주체·법정 반품기간 대조 — [상세](./todo/order-cancel-refund-exchange-flow.md#5-알려진-미해결-이슈) |
| pg_cron 반품환불 자동 트리거 등록 | 프로덕션 도메인 확정 후 | `schedule_process_returns.sql` 준비됨, 도메인 플레이스홀더만 남음 |
| **`.server.ts` / 시크릿 노출 감사** | 다음 | service_role·서버 키 클라이언트 번들 노출 점검 |
| P0-3 잔여 — PostHog / WebView 브리지 / Edge Function 표준화 | 대기 | |
| 전체 테이블 RLS 적용 (~33개) | 출시 전 하드닝 | 실데이터 없어 긴급도 낮음. 정책은 개발단계 선행 (Phase 4 P4-3) |
| PostHog / WebView 에러 브리지 | 출시 전(QA) | |

> 외부 의존성: **Toss 실키 심사 대기** / NICE는 Holding

---

## 🏗️ 시스템 아키텍처 스냅샷

- **kend** (웹): React Router SSR, Remix-style loader/action, Tailwind + shadcn/ui
- **kend-native** (앱): React Native + WebView (iOS/Android)
- **kend-seller** (판매자 관리자): 웹 전용
- **단일 Supabase DB**: PostgreSQL + Drizzle ORM (RLS로 권한 제어 — ⚠️ **현재 미적용, 출시 전 하드닝 예정**)
- **결제**: TossPayments (E2E 검증 완료/테스트 키, `PAYMENT_COMING_SOON`로 차단 중, 실키 심사 대기)
- **소셜 로그인**: Google, Kakao, Naver, Apple

> 상세: [core/application-architecture.md](./core/application-architecture.md)

---

## 📂 문서 구조

| 폴더 | 역할 |
|------|------|
| `core/` | 프로젝트 기반 reference (아키텍처, DB, 인증, UI, 결제 등) |
| `active/` | 현재 진행 중인 plan/todo |
| `todo/` | 아직 시작 전 plan |
| `archive/` | 완료/보류 |
| `changelog-{kend,seller,native}.md` | 시스템별 변경 이력 (3개 프로젝트 수동 sync) |

> 규칙: [core/readme-structure-guide.md](./core/readme-structure-guide.md)

---

## 🚧 출시 전 반드시 필요한 작업 (체크리스트)

- [ ] iOS 심사 통과
- [x] 결제 E2E 검증 (테스트 키) → [ ] 실키 전환(라이브키) — 심사 대기 *(NICE는 Holding)*
- [x] 주문 취소·전액 환불 (P1-5) / [x] 재고 차감·복원 (P2-4) / [x] SLA 자동취소 (P2.5-1) / [x] 구매확정 (P2.5-2) / [x] 플랫폼 조건부 무료배송 (P2.5-5) / [x] 반품(P2.5-3, 교환 제외) / [x] 문의하기 kend 부분(P2.5-4) → [ ] 교환(P2.5-3) / 문의하기 seller 처리화면(P2.5-4)
- [ ] Supabase dev/prod 환경 분리
- [ ] 전체 테이블 RLS 적용·검증 (~33개, kend/seller 공유 DB)
- [ ] 에러 핸들링 잔여 (PostHog, WebView 에러 브리지, QA)
- [x] kend-seller Phase 2 핵심(판매자 기반·주문관리·배송처리·재고차감) 완료 → [ ] Phase 2.5(반품/환불/구매확정)

---

## 🔮 장기 로드맵 (출시 후)

- **휴대폰 인증(SMS OTP) 도입** — `feature/phone-auth` 브랜치 보존, 출시 후 재개
- React Query 기반 CSR 전환 (SSR 병목 완화) — [client-rendering-plan](./todo/client-rendering-plan.md)
- C2C 2차 시장 (MVP Phase 2) — [application-architecture §MVP Roadmap](./core/application-architecture.md)
- NICE 본인확인 서비스 업그레이드 (결제/본인확인)
- 성장 데이터 더미 → 실데이터 점진 전환 — [growth-data-transition-plan](./todo/growth-data-transition-plan.md)
