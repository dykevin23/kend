# KEND 프로젝트 현재 상황 (Overview)

> 최종 업데이트: 2026-08-07
> 프로젝트 현재 상태를 한눈에 보는 **단일 대시보드**. 개발 진행마다 갱신한다.
> 완료 상세 → [changelog-kend.md](./changelog-kend.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md) / Phase 트래킹 → [kend-milestones.md](./kend-milestones.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND** — 자녀 성장정보 기반 유아용품 추천/거래 플랫폼. React Native WebView(앱) + React Router 웹앱(kend) + 판매자 관리자 웹(kend-seller), 단일 Supabase DB 구조. 현재 **MVP 출시 준비** 단계.

---

## 🚦 지금 상황 (2026-08-07)

- 🚨 **iOS App Store 심사 3달+ 정체** — 문의에도 "곧 처리"만. ASC 상태/Resolution Center 확인 → escalate → 빌드 리셋 재제출 트랙. **개발은 병렬 진행**
- 🎉 **법인 설립·법인 계좌 완료** → 결제/정산 외부 의존성 해소. **TossPayments 실키 신청 완료(심사 대기)**. NICE는 Holding(본인확인 불필요 방향)
- ✅ **결제 도메인 실질 완성**: 결제 E2E + 주문 취소·전액 환불(P1-5) 모두 테스트 키로 동작 확인. `PAYMENT_COMING_SOON=true`로 차단 중
- ✅ **Phase 2.5 진행 중 — P2.5-1(SLA)·P2.5-2(구매확정)·P2.5-5(플랫폼 조건부 무료배송) 완료**: 주문상세 타임라인 화면(죽어있던 `getOrderGroupDetail` 재활용) + 수동/자동(7일) 구매확정, kend-seller의 `platform_settings`와 연동해 장바구니 총액 기준 배송비 면제(`shipping_fee_bearer`) 반영까지 끝남
- 🔄 **다음 — P2.5-3(반품/교환/AS 처리 시스템)**: 반품/교환은 신규 테이블 없이 기존 `delivery_items.status` 재사용(주문 상태 액션), Toss 부분환불 연동 포함 — kend가 스키마+환불로직, kend-seller가 승인/검수 화면
- 📌 **배송조회 상세 이력(택배사 단계별 이력) 화면은 백로그로 보류**: 스마트택배 API에 데이터는 있으나 kend-seller `sync-tracking`이 현재 안 읽고 있음, Phase 미배정 상태로 기록만 해둠
- **다음 개발 후보**: P2.5-3(반품/교환/AS) → P2.5-4(문의하기) / `.server.ts` 시크릿 노출 감사 / P0-3 잔여

---

## ✅ 최근 완료

- 2026-08-07: **P2.5-2(구매확정+주문상세) / P2.5-5(플랫폼 조건부 무료배송) 완료** — 타임라인 화면, 수동/자동(7일) 구매확정, kend-seller `platform_settings` 연동. 시뮬레이션 테스트 통과 ✅
- 2026-08-06: **Phase 2.5 착수 — SLA 자동취소 cron + 스키마 확장 (P2.5-1)** — 판매자확인/발송 SLA cron, 반품사유·배송비부담주체·RTS상태·confirmed_at 스키마 확장 ✅
- 2026-08-04: **로드맵 재구성** — Phase 2 종료 + Phase 2.5/3/3.5 신설 ✅ / **재고 hold 유지시간 30분→15분 단축**
- 2026-07-27: **재고 차감/복원 연동 (P2-4)** — 차감/복원 트리거 + 결제이탈 정리 cron, 실사용 버그 3건 수정 ✅

> 상세: [changelog-kend.md](./changelog-kend.md)

---

## 🔄 진행 중 / 대기 (active)

| 항목 | 상태 |
|------|------|
| [ios-review-rejection-apr14](./active/ios-review-rejection-apr14.md) | 🚨 심사 정체 → escalate 필요 |
| [internal-test-1st](./active/internal-test-1st.md) | 15/18 완료, 잔여는 휴대폰 인증 연계(이연) |
| [native-swipe-blacklist](./active/native-swipe-blacklist.md) | 네이티브 적용 대기 |
| [environment-separation-plan](./active/environment-separation-plan.md) | 출시 전 필수, 미착수 |
| [order-lifecycle-master-plan](./todo/order-lifecycle-master-plan.md) | Phase 2.5 진행 중 — P2.5-1/2/5 완료, P2.5-3(반품/교환/AS) 착수 예정 |

---

## 📋 다음 작업

| 항목 | 우선순위 | 비고 |
|------|---------|------|
| **반품/교환/AS 처리 시스템 (P2.5-3)** | **다음** | 신규 테이블 없이 `delivery_items.status` 재사용, kend-seller가 승인화면 |
| Toss 부분환불 연동 | Phase 2.5 | 판매자 취소 시 환불 자동화 안 되는 기존 버그도 같이 해결됨 |
| 문의하기 Q&A 코어 (P2.5-4) | Phase 2.5 | |
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
- [x] 주문 취소·전액 환불 (P1-5) / [x] 재고 차감·복원 (P2-4) / [x] SLA 자동취소 (P2.5-1) / [x] 구매확정 (P2.5-2) / [x] 플랫폼 조건부 무료배송 (P2.5-5) → [ ] 반품/교환/AS/문의 (P2.5-3, 4)
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
