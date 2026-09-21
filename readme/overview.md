# KEND 프로젝트 현재 상황 (Overview)

> 최종 업데이트: 2026-09-21
> 프로젝트 현재 상태를 한눈에 보는 **단일 대시보드**. 개발 진행마다 갱신한다.
> 완료 상세 → [changelog-kend.md](./changelog-kend.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md) / Phase 트래킹 → [kend-milestones.md](./kend-milestones.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND** — 자녀 성장정보 기반 유아용품 추천/거래 플랫폼. React Native WebView(앱) + React Router 웹앱(kend) + 판매자 관리자 웹(kend-seller), 단일 Supabase DB 구조. 현재 **MVP 출시 준비** 단계.

---

## 🚦 지금 상황 (2026-09-17)

- 🟡 **TossPayments 실키 계약심사 — Toss 회신 수신(2026-09-08), 사용자 결정 2건 대기**: URL 제출/실 상품 노출/결제경로 파일 방식은 답 나옴(그대로 진행 가능). **결제 최고가 금액 확정**·**임시 등록할 실 판매 예정 상품 선정**은 사용자(대표) 결정 필요 — 결정되는 대로 임시 상품 등록 → 결제경로 PPT 캡처 → 회신. ⚠️ Toss 문의량 폭주로 **회신까지 1~2개월 소요 가능** 안내받음, 9월 말 내부 타겟에 영향 가능성. 상세: [tosspayments-review-checklist.md](./tosspayments-review-checklist.md)
- 🚨 **iOS App Store 심사 3달+ 정체** — Guideline 5.6 재제출정지 → appeal 승인(새 binary 재제출 가능)됐으나, 개발 완성도 더 끌어올린 뒤 재제출하는 쪽으로 **의도적 보류** 중. 상세: [kend-milestones.md P0-1](./kend-milestones.md)
- 🎉 **법인 설립 완료**, **통신판매업 신고는 아직**(Toss PG계약 시 발급되는 구매안전서비스 이용확인증이 선행돼야 해서 순서상 정상 — EXT-1b). NICE는 Holding(본인확인 불필요 방향)
- ✅ **Phase 3(kend-seller 관리보완) 대량 진척** — 상품수정(B-1)·재고관리 Stocks Keeping(B-2)·Seller 대시보드+디자인시스템 리뉴얼(B-3)·공지사항(B-5)·리뷰관리(B-7) 전부 실사용 테스트까지 완료. **CS관리(B-4)는 구현 완료, 클릭 테스트만 대기**(kend-seller 자체 changelog에 명시). 남은 건 교환(B-6, 정책 대기) 뿐 — 상세 [kend-milestones.md Phase 3](./kend-milestones.md)
- ⚠️ **반품 정책 법률 검토 필요 발견**: 반품 사유 자가신고(증빙 없음) + 반품배송비 부담주체 미구현 + 판매자귀책 사유 반품기간이 전자상거래법 법정기준보다 짧을 가능성 — 상세는 [order-cancel-refund-exchange-flow.md §5-4](./todo/order-cancel-refund-exchange-flow.md). **Toss 실키 전환 전 법률 검토 권장**
- **다음 개발 후보**: Toss 문의 답변 대응(최우선) → P2.5-3 교환(정책 결정 선행) → `.server.ts` 시크릿 노출 감사 / P0-3 잔여 → CS관리 실사용 클릭 테스트

---

## ✅ 최근 완료

- 2026-09-21: **"최근 본 상품" 기능(kend, Phase 3)** — `product_views` 테이블(찜 테이블과 동일 패턴, 로그 아님) 신설, 조회 기록을 컴포넌트 마운트 후 액션으로 분리(loader에 뒀다가 `ProductCard` prefetch로 오탐지되던 버그 실사용 테스트로 발견해 수정). 실사용 재검증 통과 ✅
- 2026-09-21: **`follows` 테이블/`profiles.stats` 정리(kend)** — 예전 사람 팔로우 기능 잔재(고아 테이블) DB drop 완료·확인. 스토어 카드 찜 UI는 `likeCount`로 명명 정리 ✅
- 2026-09-21: **상품상세 타이틀 옆 별점·리뷰수 하드코딩 제거(kend)** — "4.6·리뷰(4,321)" 고정 표기를 실데이터로 교체(09-07 정리 때 놓쳤던 블록), 타이틀과 한 줄 우측정렬로 레이아웃 조정 — 구현됨, 실사용 화면 확인 대기
- 2026-09-17: **공지사항 화면(kend↔seller, B-5)** — kend-seller `notices` 스키마+admin CRUD+판매자 조회화면, kend `/myPage/notices` 연결(target 필터로 SELLER 전용 제외). 양쪽 실사용 테스트 통과(kend-seller 사용자 확인) ✅
- 2026-09-16: **"현재 위치로 주소 찾기" 배지 표시(kend)** — GPS로 채워진 주소임을 알리는 배지 UI 보강, 우편번호 직접 재검색 시 해제 ✅

> 상세: [changelog-kend.md](./changelog-kend.md)

---

## 🔄 진행 중 / 대기 (active)

| 항목 | 상태 |
|------|------|
| iOS 심사 (P0-1) | 🚨 appeal 승인, 개발 완성도 확보 후 재제출 (의도적 보류) — 상세 [milestones P0-1](./kend-milestones.md) |
| 결제 앱 WebView 보강 | kend 재배포 + [native-payment-webview-handoff](./todo/native-payment-webview-handoff.md) EAS 빌드 대기 |
| [native-swipe-blacklist](./active/native-swipe-blacklist.md) | 결제 리다이렉트 구간 포함 재정비 완료 (2026-09-10), EAS 빌드 대기 |
| [environment-separation-plan](./todo/environment-separation-plan.md) | Phase 4, 출시 전 필수, 미착수 |
| CS관리(B-4) | kend-seller 구현 완료, 실사용 클릭 테스트 대기 |
| 교환(exchange) | Phase 3, 정책 미정으로 착수 불가 |

> 완료된 계획은 `archive/`로 이동함 (internal-test-1st 15/18, ios-review-rejection-apr14 스냅샷 등).

---

## 📋 다음 작업

| 항목 | 우선순위 | 비고 |
|------|---------|------|
| **Toss 계약심사 — 결정 2건 + PPT 준비** | **최우선** | ①결제 최고가 금액 확정 ②임시 등록할 실 판매 예정 상품 선정(사용자 결정 필요) → 상품 등록 → 결제경로 PPT 캡처 → 홈페이지 URL과 함께 회신. [상세](./tosspayments-review-checklist.md) |
| **P2.5-3 교환(exchange)** | 다음 | 정책 미정 항목 다수(옵션재고 없을때 처리, 배송비 부담주체, 횟수제한 등) — 착수 전 정책 결정 필요 |
| 반품 정책 법률 검토 (전자상거래법) | 실키 전환 전 | 사유 자가신고 검증·배송비 부담주체·법정 반품기간 대조 — [상세](./todo/order-cancel-refund-exchange-flow.md#5-알려진-미해결-이슈) |
| pg_cron 반품환불 자동 트리거 등록 | 프로덕션 도메인 확정 후 | `schedule_process_returns.sql` 준비됨, 도메인 플레이스홀더만 남음 |
| **`.server.ts` / 시크릿 노출 감사** | 다음 | service_role·서버 키 클라이언트 번들 노출 점검 |
| P0-3 잔여 — PostHog / WebView 브리지 / Edge Function 표준화 | 대기 | |
| 전체 테이블 RLS 적용 (~33개) | 출시 전 하드닝 | 실데이터 없어 긴급도 낮음. 정책은 개발단계 선행 (Phase 4 P4-3) |
| PostHog / WebView 에러 브리지 | 출시 전(QA) | |

> 외부 의존성: **Toss 실키 계약심사 진행 중(회신 수신, 사용자 결정 2건 대기 — 회신까지 1~2개월 소요 가능 안내받음)** / 통신판매업 신고는 PG계약 완료 후 진행 / NICE는 Holding

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
- [x] 결제 E2E 검증 (테스트 키), 결제 기능 활성화 → [ ] 실키 전환(라이브키) — 계약심사 진행 중(회신 수신, 사용자 결정 2건 대기) *(NICE는 Holding)*
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
