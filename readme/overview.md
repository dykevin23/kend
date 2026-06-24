# KEND 프로젝트 현재 상황 (Overview)

> 최종 업데이트: 2026-06-24
> 프로젝트 현재 상태를 한눈에 보는 **단일 대시보드**. 개발 진행마다 갱신한다.
> 완료 상세 → [changelog-kend.md](./changelog-kend.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md) / Phase 트래킹 → [kend-milestones.md](./kend-milestones.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND** — 자녀 성장정보 기반 유아용품 추천/거래 플랫폼. React Native WebView(앱) + React Router 웹앱(kend) + 판매자 관리자 웹(kend-seller), 단일 Supabase DB 구조. 현재 **MVP 출시 준비** 단계.

---

## 🚦 지금 상황 (2026-06-24)

- 🚨 **iOS App Store 심사 2달+ 정체** — 1달 전 문의에도 "곧 처리"만. ASC 상태/Resolution Center 확인 → escalate(전화 콜백) → 빌드 리셋 재제출 트랙으로 대응. **개발은 병렬 진행**
- **계정/인증 트랙 정리 완료**: 이메일 비밀번호 재설정 구현 / 휴대폰 SMS 인증은 출시 후로 이연(이메일 재설정으로 대체) / 아이디 찾기 제거
- **주문/결제 도메인 거의 구현됨**: 결제는 `PAYMENT_COMING_SOON`으로 막아둠. 남은 건 코딩이 아니라 **Toss 테스트 키(EXT-3) 발급 + E2E 검증**
- **다음 개발**: P0-3 에러 핸들링 잔여 — 오프라인 감지·console.log 정리 완료, 다음은 PostHog·WebView 브리지·Edge Function 표준화

---

## ✅ 최근 완료

- 2026-06-24: **디버그 console.log 정리** (P0-3, 8건 제거)
- 2026-06-24: **오프라인 감지** (useNetworkStatus 훅 + 오프라인 배너, root 연동) — 실기기 비행기모드로 동작 확인 ✅
- 2026-06-24: 문서 체계 정비 — overview 대시보드 복구 + structure-guide §8 + /changelog 명령어 개편
- 2026-06-23: 계획 문서(roadmap/milestones) 현실화 — 휴대폰 인증 이연 / 결제·주문 거의 완료 / RLS 전체 범위 반영

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
| P0-3 잔여 — PostHog / WebView 브리지 / Edge Function 표준화 | 다음 | 오프라인·console.log 완료(6/24) |
| 결제 E2E 검증 | 대기 | Toss 테스트 키(EXT-3) 발급 후 |
| kend-seller Phase 2 (판매자 기반 → 주문관리) | 다음 큰 블록 | 시드 주문으로 결제 없이도 진행 가능 |
| 환불/취소/구매확정 (P1-5) | 출시 전 | 결제 후속 |
| 전체 테이블 RLS 적용 (~33개) | 출시 전 하드닝 | 실데이터 없어 긴급도 낮음. 정책은 개발단계 선행 |
| PostHog / WebView 에러 브리지 | 출시 전(QA) | |

> 외부 의존성 신청 (리드타임): **EXT-3 Toss 테스트 키**, **EXT-4 스마트택배 API** — 막진 않지만 미리 걸어둬야 함

---

## 🏗️ 시스템 아키텍처 스냅샷

- **kend** (웹): React Router SSR, Remix-style loader/action, Tailwind + shadcn/ui
- **kend-native** (앱): React Native + WebView (iOS/Android)
- **kend-seller** (판매자 관리자): 웹 전용
- **단일 Supabase DB**: PostgreSQL + Drizzle ORM (RLS로 권한 제어 — ⚠️ **현재 미적용, 출시 전 하드닝 예정**)
- **결제**: TossPayments (현재 `PAYMENT_COMING_SOON` 차단, 테스트 키 대기)
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
- [ ] 결제 E2E 검증 + 실키 전환 (TossPayments 테스트키 → 라이브키, 본인확인)
- [ ] 환불/취소/구매확정 구현 (P1-5)
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
