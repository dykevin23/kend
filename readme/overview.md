# KEND 프로젝트 현재 상황 (Overview)

> 최종 업데이트: 2026-11-25
> 프로젝트 현재 상태를 한눈에 보는 **단일 대시보드**. 개발 진행마다 갱신한다.
> 완료 상세 → [changelog-kend.md](./changelog-kend.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md) / Phase 트래킹 → [kend-milestones.md](./kend-milestones.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND** — 자녀 성장정보 기반 유아용품 추천/거래 플랫폼. React Native WebView(앱) + React Router 웹앱(kend) + 판매자 관리자 웹(kend-seller), 단일 Supabase DB 구조. 현재 **MVP 출시 준비** 단계.

---

## 🚦 지금 상황 (2026-11-25)

- 🟢 **iOS 출시 준비 단계** — 환경 분리(dev/prod)·Toss 라이브 키·도메인 `kend.co.kr`·소셜 로그인 5종 운영 전환 완료(11-11). 운영 앱 빌드 28이 TestFlight에서 `kend.co.kr`로 동작 중. 남은 순서는 아래 "다음 작업"
- ✅ **앱 푸시 알림 운영 적용** — 알림 설정 placeholder(Apple 2.1/5.6 리젝 위험) 해소. 주문·배송·반품·문의 답변 7종, 알림함, 빌드 28 수신·탭 이동 확인. 권한 방식 변경(첫 실행 팝업·상황별 카드)은 development에만 있음 → 운영 머지 대기
- ✅ **Toss 계약심사 완료**(10-15) → 라이브 키 운영 적용(11-11). 실결제 검증은 아직(운영 판매자·상품 등록 후 소액 결제)
- 🟡 **통신판매업 신고** — 접수·등록면허세 납부(11-17), **신고증 대기**. 받으면 신고번호 표시 + 통신판매중개자 고지(중개·직접판매 둘 다 사업자 업종에 있음)
- ⏸ **Google 로그인 브랜딩 인증 보류** — 승인된 도메인에 `*.supabase.co`가 있어 소유권 확인 불가. prod Pro 전환 + Supabase 커스텀 도메인 때 함께(기한 없음, 로그인 동작엔 영향 없음)
- 🚨 iOS 심사: 06-23 5.6 → 07-29 appeal 승인(새 빌드 재제출 가능), **출시 준비 마친 뒤 제출**

---

## ✅ 최근 완료

- 2026-11-25: **앱 푸시 알림 운영 적용** — 운영 DB·`send-push`·웹 반영, TestFlight 빌드 28에서 앱 켜짐/종료 상태 수신·탭 이동 확인 ✅ (운영 주문 트리거는 실주문 시 재확인)
- 2026-11-25: **주문 상세·목록 다듬기** — 작은 outline 버튼 연회색, 판매자 줄 "문의하기 >", 문의 상세 "목록으로" 제거, 취소 건 빈 타임라인 수정 ✅
- 2026-11-24: **당겨서 새로고침(목록 5곳)·화면 이동 중 조작 차단·주문 상세에서 문의하기(주문·상품 자동 선택)** ✅
- 2026-11-19: **공개 홈페이지 `/`·공개 고객지원 `/support`** + 앱 접속 판별 쿠키(native 수정 없이) — 운영 확인 ✅
- 2026-11-11: **환경 분리·운영 전환** (prod Supabase, Toss 라이브 키, 도메인, 소셜 로그인 5종) + **시간 컬럼 timestamptz**(9시간 어긋남) ✅
- 2026-10-15~23: **디자인 리뉴얼** (토큰·공통 컴포넌트·주요 화면·인증 화면) ✅

> 상세: [changelog-kend.md](./changelog-kend.md)

---

## 🔄 진행 중 / 대기 (active)

| 항목 | 상태 |
|------|------|
| [environment-separation-plan](./active/environment-separation-plan.md) | A~D 완료·운영 전환. 남은 것: E RLS · F 라이브 결제 검증(void 처리 포함) · G 운영 메일 SMTP |
| [push-notification-plan](./active/push-notification-plan.md) | iOS 운영 완료. 권한 방식 변경 운영 머지 대기, Android(FCM)는 Android 출시 때 |
| [web-access-policy](./active/web-access-policy.md) | 1단계(공개 홈페이지·판별 쿠키) 완료. 2단계 PC·모바일 브라우저 차단(운영만) 미착수 |
| [native-swipe-blacklist](./active/native-swipe-blacklist.md) | 결제 구간 포함 재정비 완료, 빌드 반영됨 — 정리 후 archive 후보 |
| 통신판매업 신고증 | 대기 (사용자) |
| 교환(exchange) | 정책 미정으로 착수 불가 |

---

## 📋 다음 작업 (iOS 출시 순서)

| 항목 | 우선순위 | 비고 |
|------|---------|------|
| 알림 권한 방식 변경 운영 머지 | 바로 | 설정 앱에서 켠 사용자 토큰 미등록 버그 수정 포함 |
| **PostHog** (행동 로그 + 웹 에러) | 다음 | 이벤트 목록 계획 먼저. 처리방침·App Store 라벨에 "이용 행태 분석" 추가 |
| **RLS** (~40개 테이블, kend·seller) + 동의 기록 + 탈퇴 시 거래기록 5년 보관 + 약관 DB 버전 관리 | 출시 전 필수 | 약관·처리방침은 관리자 입력·버전 관리, 출시 문서를 v1로. 처리방침 전체 정리(회사명·담당부서·위탁 업체) 함께 |
| 리젝 위험 웹 항목 | 출시 전 | 탈퇴 시 Apple 토큰 철회, 네이버 state CSRF, (신고증 후) 신고번호·중개자 고지 |
| confirm 실패 void → prod 판매자·상품 등록 → 라이브 소액 결제·취소 | 출시 전 | 이때 운영 주문 푸시도 확인 |
| 운영 메일 SMTP · native 충돌 모니터링 | 출시 전 | 비밀번호 재설정 메일 |
| prod Pro 전환(백업) + 커스텀 도메인 + Google 브랜딩 | App Store 제출 2~3주 전 권장 | 브랜딩은 늦어져도 무방 |
| 데모 계정·App Store Connect 입력 → 심사 제출 | 마지막 | 지원 URL `kend.co.kr/support` |

> 출시 후: Expo SDK 58(UIScene, ~2027-03 전), 앱 강제 업데이트, 크론 실패 알림, 가입 CAPTCHA, Android 출시(FCM 포함)

---

## 🏗️ 시스템 아키텍처 스냅샷

- **kend** (웹): React Router SSR, Remix-style loader/action, Tailwind + shadcn/ui
- **kend-native** (앱): React Native + WebView (iOS/Android)
- **kend-seller** (판매자 관리자): 웹 전용
- **Supabase dev/prod 분리** (2026-11): dev = 로컬·개발 서버(development 브랜치), prod = `kend.co.kr`(master). PostgreSQL + Drizzle ORM (RLS — ⚠️ **알림 테이블만 적용, 전체는 출시 전 하드닝**)
- **결제**: TossPayments — 운영 라이브 키, 개발 테스트 키 (실결제 검증 전)
- **앱 푸시**: DB 트리거 → pg_net → Edge Function `send-push` → Expo Push (iOS)
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
- [x] 결제 E2E 검증(테스트 키) / [x] Toss 계약심사 완료·라이브 키 운영 적용 → [ ] 라이브 실결제·취소 검증 (+ confirm 실패 void)
- [ ] 통신판매업 신고 — 접수·납부 완료, 신고증 대기 → 신고번호 표시·중개자 고지
- [x] 주문 라이프사이클(취소·환불·재고·SLA·구매확정·반품·문의·정산) → [ ] 교환(정책 미정)
- [x] Supabase dev/prod 환경 분리 · 도메인 · 소셜 로그인 5종 운영 전환
- [x] 앱 푸시 알림(iOS) — 알림 설정 placeholder 해소
- [ ] 전체 테이블 RLS 적용·검증 (~40개, kend/seller 공유) + 동의 기록 + 탈퇴 시 거래기록 보관
- [ ] PostHog(행동 로그·웹 에러) + native 충돌 모니터링
- [ ] 리젝 위험 항목: Apple 토큰 철회, 네이버 state CSRF
- [ ] 운영 메일 SMTP, DB 백업(prod Pro)
- [ ] 데모 계정·App Store Connect 입력

---

## 🔮 장기 로드맵 (출시 후)

- **휴대폰 인증(SMS OTP) 도입** — `feature/phone-auth` 브랜치 보존, 출시 후 재개
- React Query 기반 CSR 전환 (SSR 병목 완화) — [client-rendering-plan](./todo/client-rendering-plan.md)
- C2C 2차 시장 (MVP Phase 2) — [application-architecture §MVP Roadmap](./core/application-architecture.md)
- NICE 본인확인 서비스 업그레이드 (결제/본인확인)
- 성장 데이터 더미 → 실데이터 점진 전환 — [growth-data-transition-plan](./todo/growth-data-transition-plan.md)
