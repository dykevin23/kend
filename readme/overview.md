# KEND 프로젝트 현재 상황 (Overview)

> 최종 업데이트: 2026-07-22
> 프로젝트 현재 상태를 한눈에 보는 **단일 대시보드**. 개발 진행마다 갱신한다.
> 완료 상세 → [changelog-kend.md](./changelog-kend.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md) / Phase 트래킹 → [kend-milestones.md](./kend-milestones.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND** — 자녀 성장정보 기반 유아용품 추천/거래 플랫폼. React Native WebView(앱) + React Router 웹앱(kend) + 판매자 관리자 웹(kend-seller), 단일 Supabase DB 구조. 현재 **MVP 출시 준비** 단계.

---

## 🚦 지금 상황 (2026-07-22)

- 🚨 **iOS App Store 심사 3달+ 정체** — 문의에도 "곧 처리"만. ASC 상태/Resolution Center 확인 → escalate → 빌드 리셋 재제출 트랙. **개발은 병렬 진행**
- 🎉 **법인 설립·법인 계좌 완료** → 결제/정산 외부 의존성 해소. **TossPayments 실키 신청 완료(심사 2~4주 대기)**. NICE는 Holding(본인확인 불필요 방향)
- ✅ **결제 도메인 실질 완성**: 결제 E2E(주문→결제→`paid`) + **주문 취소·전액 환불(P1-5)** 모두 테스트 키로 동작 확인. 코드는 `PAYMENT_COMING_SOON=true`로 차단(실키+출시 때 켬)
- ⚠️ **마일스톤 보드 Phase 2 상태 미검증**: P2-1~P2-6이 2026-04 계획 시점 그대로라 kend-seller 실측 코드와 어긋날 수 있음 — 착수 전 정정 필요
- 🔧 **스토어 목록 버그 수정(테스트 대기)**: 상품 미등록 판매자가 목록에 No-Image로 노출되던 문제, 쿼리 필터 추가로 수정 — 브라우저 확인 아직
- **계정/인증**: 이메일 비밀번호 재설정 완료 / 휴대폰 SMS 인증은 출시 후 이연
- **다음 개발 후보**: 스토어 목록 fix 브라우저 검증 / `.server.ts`/시크릿 노출 감사 / 미완료결제 정리 cron / kend-seller Phase 2 / P0-3 잔여

---

## ✅ 최근 완료

- 2026-07-10: **주문 취소 + 전액 환불 (P1-5)** — Toss Cancel API + 멱등키, 상태 전환까지 동작 확인 ✅
- 2026-07-09: **결제 루프 E2E 검증 완료** (테스트 키로 주문→결제→paid 전 흐름) + 로컬 소셜로그인 리다이렉트 수정 ✅
- 2026-06-24: **디버그 console.log 정리** (P0-3, 8건 제거)
- 2026-06-24: **오프라인 감지** (useNetworkStatus 훅 + 오프라인 배너, root 연동) — 실기기 비행기모드로 동작 확인 ✅

> 상세: [changelog-kend.md](./changelog-kend.md)

---

## 🔄 진행 중 / 대기 (active)

| 항목 | 상태 |
|------|------|
| [ios-review-rejection-apr14](./active/ios-review-rejection-apr14.md) | 🚨 심사 2달+ 정체 → escalate 필요 |
| [internal-test-1st](./active/internal-test-1st.md) | 15/18 완료, 잔여는 휴대폰 인증 연계(이연) |
| [native-swipe-blacklist](./active/native-swipe-blacklist.md) | 네이티브 적용 대기 |
| [environment-separation-plan](./active/environment-separation-plan.md) | 출시 전 필수, 미착수 |

---

## 📋 다음 작업

| 항목 | 우선순위 | 비고 |
|------|---------|------|
| 스토어 목록 무상품 판매자 제외 — 브라우저 검증 | **다음** | 쿼리 필터는 반영됨, 실제 화면 확인만 남음 |
| **`.server.ts` / 시크릿 노출 감사** | 다음 | service_role·서버 키가 클라이언트 번들에 섞였는지 점검 (`my-page.tsx` 등) |
| 미완료결제 정리 cron (`payment_in_progress`→`failed`) | 출시 전 | 가벼움 |
| 구매확정 + 부분취소 | Phase 2 이후 | 배송(delivery_items) 도입 후 |
| P0-3 잔여 — PostHog / WebView 브리지 / Edge Function 표준화 | 대기 | |
| kend-seller Phase 2 (판매자 기반 → 주문관리) | 다음 큰 블록 | 시드 주문으로 결제 없이도 진행 가능 |
| 전체 테이블 RLS 적용 (~33개) | 출시 전 하드닝 | 실데이터 없어 긴급도 낮음. 정책은 개발단계 선행 |
| PostHog / WebView 에러 브리지 | 출시 전(QA) | |

> 외부 의존성: **Toss 실키 심사 대기(2~4주)** / **EXT-4 스마트택배 API** 신청 필요(Phase 2 배송용). NICE는 Holding

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
- [x] 주문 취소·전액 환불 (P1-5) → [ ] 구매확정 (Phase 2 이후)
- [ ] Supabase dev/prod 환경 분리
- [ ] 전체 테이블 RLS 적용·검증 (~33개, kend/seller 공유 DB)
- [ ] 에러 핸들링 잔여 (오프라인 감지, PostHog, WebView 에러 브리지, QA)
- [ ] kend-seller Phase 2 (판매자 기반, 주문/배송 관리)

---

## 🔮 장기 로드맵 (출시 후)

- **휴대폰 인증(SMS OTP) 도입** — `feature/phone-auth` 브랜치 보존, 출시 후 재개
- React Query 기반 CSR 전환 (SSR 병목 완화) — [client-rendering-plan](./todo/client-rendering-plan.md)
- C2C 2차 시장 (MVP Phase 2) — [application-architecture §MVP Roadmap](./core/application-architecture.md)
- NICE 본인확인 서비스 업그레이드 (결제/본인확인)
- 성장 데이터 더미 → 실데이터 점진 전환 — [growth-data-transition-plan](./todo/growth-data-transition-plan.md)
