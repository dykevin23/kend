# KEND 프로젝트 현재 상황 (Overview)

> 최종 업데이트: 2026-09-07
> 프로젝트 현재 상태를 한눈에 보는 **단일 대시보드**. 개발 진행마다 갱신한다.
> 완료 상세 → [changelog-kend.md](./changelog-kend.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md) / Phase 트래킹 → [kend-milestones.md](./kend-milestones.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND** — 자녀 성장정보 기반 유아용품 추천/거래 플랫폼. React Native WebView(앱) + React Router 웹앱(kend) + 판매자 관리자 웹(kend-seller), 단일 Supabase DB 구조. 현재 **MVP 출시 준비** 단계.

---

## 🚦 지금 상황 (2026-09-07)

- 🟡 **TossPayments 실키 계약심사 진행 중 — Toss 문의 메일 회신 대기**: 실제 심사 메일 수신(URL 제출/결제 최고가/실 상품 노출/결제경로 PPT 요건 확인), 오픈마켓 구조·pre-launch 실 판매자 부재 등을 이유로 문의 메일 발송(2026-09-01). 답변 오는 대로 최종 진행. 상세: [tosspayments-review-checklist.md](./tosspayments-review-checklist.md)
- 🚨 **iOS App Store 심사 3달+ 정체** — Guideline 5.6 재제출정지 → appeal 승인(새 binary 재제출 가능)됐으나, 개발 완성도 더 끌어올린 뒤 재제출하는 쪽으로 **의도적 보류** 중. 상세: [kend-milestones.md P0-1](./kend-milestones.md)
- 🎉 **법인 설립 완료**, **통신판매업 신고는 아직**(Toss PG계약 시 발급되는 구매안전서비스 이용확인증이 선행돼야 해서 순서상 정상 — EXT-1b). NICE는 Holding(본인확인 불필요 방향)
- ✅ **Phase 3.5(정산 시스템) 종료** — kend-seller 계좌등록·계산배치·조회화면 전부 완료·실사용 테스트 통과 확인(2026-09-03). 계산 로직은 kend-seller 소유(스키마 소유 원칙: 실제 read/write하는 앱이 소유)
- ✅ **리뷰 작성/조회(kend) + 찜 목록 스토어 탭 완료, 실사용 테스트 통과**: 구매확정 건당 리뷰 작성, 이미지 최대 5장, 판매자 답변 스키마 선행 준비(`seller_reply`), 뒤로가기 문제를 근본 해결하기 위해 작성 폼을 전체화면 팝업(Modal) 방식으로 재설계. **kend-seller가 리뷰관리 화면(답변/통계/날짜검색/미답변필터) 진행 중** — kend은 스키마·표시 화면 전부 준비 완료라 seller 완료 시 추가 작업 불필요
- ⚠️ **반품 정책 법률 검토 필요 발견**: 반품 사유 자가신고(증빙 없음) + 반품배송비 부담주체 미구현 + 판매자귀책 사유 반품기간이 전자상거래법 법정기준보다 짧을 가능성 — 상세는 [order-cancel-refund-exchange-flow.md §5-4](./todo/order-cancel-refund-exchange-flow.md). **Toss 실키 전환 전 법률 검토 권장**
- **다음 개발 후보**: Toss 문의 답변 대응(최우선) → P2.5-3 교환(정책 결정 선행) → `.server.ts` 시크릿 노출 감사 / P0-3 잔여 → Phase 3(관리보완) 착수 검토

---

## ✅ 최근 완료

- 2026-09-07: **리뷰 작성/조회 기능(kend)** — 구매확정 건당 1개 정책, 이미지 5장 첨부, 판매자 답변 스키마, 작성 폼을 전체화면 팝업(Modal)으로 재설계해 뒤로가기 문제 근본 해결. 실사용 테스트 통과 ✅
- 2026-09-07: **찜 목록 "스토어" 탭** — 스토어 찜하기/찜목록 제외 기능 신규, 실사용 테스트 완료 ✅
- 2026-09-03: **Phase 3.5(정산 시스템) 종료** — kend-seller 계좌등록/계산배치/조회화면 전부 완료·실사용 테스트 통과 확인 ✅
- 2026-09-01: **TossPayments 카드사 심사 대비** — 환불정책 3곳 반영(이용약관/독립페이지/상품상세), 사업자정보 footer, 서비스 소개 페이지(`/intro`, APK 다운로드 링크 포함) ✅

> 상세: [changelog-kend.md](./changelog-kend.md)

---

## 🔄 진행 중 / 대기 (active)

| 항목 | 상태 |
|------|------|
| [ios-review-rejection-apr14](./active/ios-review-rejection-apr14.md) | 🚨 심사 정체 → escalate 필요 |
| [internal-test-1st](./active/internal-test-1st.md) | 15/18 완료, 잔여는 휴대폰 인증 연계(이연) |
| [native-swipe-blacklist](./active/native-swipe-blacklist.md) | 네이티브 적용 대기 |
| [environment-separation-plan](./active/environment-separation-plan.md) | 출시 전 필수, 미착수 |
| [order-lifecycle-master-plan](./todo/order-lifecycle-master-plan.md) | Phase 2.5 종료(2026-08-25) — 교환(P2.5-3 하위)만 정책 미정으로 별도 이연 |

---

## 📋 다음 작업

| 항목 | 우선순위 | 비고 |
|------|---------|------|
| **Toss 계약심사 문의 답변 대응** | **최우선** | URL 제출 방식, 결제 최고가, 실 상품 노출(pre-launch), 결제경로 PPT — 답변 오는 대로 진행. [상세](./tosspayments-review-checklist.md) |
| **P2.5-3 교환(exchange)** | 다음 | 정책 미정 항목 다수(옵션재고 없을때 처리, 배송비 부담주체, 횟수제한 등) — 착수 전 정책 결정 필요 |
| 반품 정책 법률 검토 (전자상거래법) | 실키 전환 전 | 사유 자가신고 검증·배송비 부담주체·법정 반품기간 대조 — [상세](./todo/order-cancel-refund-exchange-flow.md#5-알려진-미해결-이슈) |
| pg_cron 반품환불 자동 트리거 등록 | 프로덕션 도메인 확정 후 | `schedule_process_returns.sql` 준비됨, 도메인 플레이스홀더만 남음 |
| **`.server.ts` / 시크릿 노출 감사** | 다음 | service_role·서버 키 클라이언트 번들 노출 점검 |
| P0-3 잔여 — PostHog / WebView 브리지 / Edge Function 표준화 | 대기 | |
| 전체 테이블 RLS 적용 (~33개) | 출시 전 하드닝 | 실데이터 없어 긴급도 낮음. 정책은 개발단계 선행 (Phase 4 P4-3) |
| PostHog / WebView 에러 브리지 | 출시 전(QA) | |

> 외부 의존성: **Toss 실키 계약심사 진행 중(문의 회신 대기)** / 통신판매업 신고는 PG계약 완료 후 진행 / NICE는 Holding

---

## 🏗️ 시스템 아키텍처 스냅샷

- **kend** (웹): React Router SSR, Remix-style loader/action, Tailwind + shadcn/ui
- **kend-native** (앱): React Native + WebView (iOS/Android)
- **kend-seller** (판매자 관리자): 웹 전용
- **단일 Supabase DB**: PostgreSQL + Drizzle ORM (RLS로 권한 제어 — ⚠️ **현재 미적용, 출시 전 하드닝 예정**)
- **결제**: TossPayments (E2E 검증 완료/테스트 키, `PAYMENT_COMING_SOON=false`로 활성화, 실키 계약심사 진행 중)
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
- [x] 결제 E2E 검증 (테스트 키), 결제 기능 활성화 → [ ] 실키 전환(라이브키) — 계약심사 진행 중(문의 회신 대기) *(NICE는 Holding)*
- [ ] 통신판매업 신고 — Toss PG계약(구매안전서비스 이용확인증 발급) 완료 후 진행
- [x] 주문 취소·전액 환불 (P1-5) / [x] 재고 차감·복원 (P2-4) / [x] SLA 자동취소 (P2.5-1) / [x] 구매확정 (P2.5-2) / [x] 플랫폼 조건부 무료배송 (P2.5-5) / [x] 반품(P2.5-3, 교환 제외) / [x] 문의하기(P2.5-4, kend+seller+admin 전부) / [x] 정산 시스템(Phase 3.5, kend-seller) → [ ] 교환(P2.5-3, Phase 3 이관·정책 미정)
- [x] 리뷰 작성/조회(kend) / [x] 찜 목록 스토어 탭 → 🔄 리뷰관리(답변/통계, kend-seller 진행 중)
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
