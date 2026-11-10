# KEND 환경 분리 + 라이브 결제 전환 계획

> **목표**: 운영(prod)과 개발(dev) 환경을 분리해 운영 DB를 보호하고, 운영에만 Toss 라이브 키를 적용한다. iOS 재제출 전 필수.
> **상태**: 계획 확정 (2026-11-04), 착수 전
> **범위**: kend + kend-seller(같은 DB 공유) + kend-native(웹 URL 하드코딩). seller·native 실제 편집은 해당 단계에서 별도 승인 후 진행.
> 이전판(2026-04-14)은 "지금 프로젝트=prod, 새 프로젝트=dev" 전제였으나 아래 결정으로 대체됨.

---

## 1. 확정된 결정

| 항목 | 결정 | 이유 |
|------|------|------|
| Supabase 역할 | **지금 프로젝트(`obbpfpdlqbyplrakclhh`) → dev**, **prod는 새로 생성** | 현재 데이터가 전부 테스트 데이터. prod에서 테스트 데이터를 지우는 위험한 정리 작업이 사라지고, 개발은 기존 테스트 계정·seller 데이터로 그대로 이어감. 소셜 로그인 재등록 공수는 어느 쪽이든 동일 |
| 도메인 | **`kend.co.kr`** (가비아, 2026-11-04 등록), seller는 **`seller.kend.co.kr`** | native에 URL이 박혀 있어 주소 변경 = 앱 재심사 + 구버전 사용자 문제. 운영 메일 발송(커스텀 SMTP)에도 소유 도메인 필요 |
| Vercel 환경 | Production = `master` = 운영 / Preview = `development` 브랜치(신규) = 개발 서버 / Development = 로컬 | Vercel의 "Development"는 배포 서버가 아니라 로컬(`vercel dev`, `env pull`)용 |
| RLS | 분리 **후** dev에서 작성·테스트 → **출시 전** prod 적용 | 공유 DB에서 켜면 kend·seller 동시 장애. anon key가 클라이언트 번들에 있어 RLS 없이 실사용자를 받으면 전체 테이블 노출 |
| pre-production | 지금은 만들지 않음. 필요 시 **prod 덤프(개인정보 마스킹) → 별도 staging Supabase** 방식 | prod DB 직접 연결은 테스트 주문이 실재고·정산에 섞임 |
| API 키 | dev·prod 모두 **새 키(`sb_publishable_`/`sb_secret_`)**, prod는 legacy 비활성화(2026-11-04), dev는 Vercel·seller 전환 후 비활성화 | legacy `anon`/`service_role`은 2026년 말 폐기 예정. 새 키는 JWT가 아니라 `apikey` 헤더로 보내고 Edge Function은 코드에서 키 검사 (`verify_jwt=false`) |

### 환경변수 이름 (2026-11-05 변경, `development` 브랜치)

| 예전 | 새 이름 |
|------|---------|
| `SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY` | `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SECRET_KEY` |

→ Vercel에 새 이름으로 값이 들어가기 전에 master에 머지하면 운영 배포가 깨짐 (D단계에서 함께)

### 최종 구성

```
Vercel kend         Production (master)      → kend.co.kr            → Supabase prod  + Toss 라이브
                    Preview (development)    → (선택) dev.kend.co.kr  → Supabase dev   + Toss 테스트
Vercel kend-seller  Production (master)      → seller.kend.co.kr     → Supabase prod
                    Preview (development)                            → Supabase dev
로컬 .env                                                            → Supabase dev   + Toss 테스트
```

### 비용 (출시 시점)

- Supabase prod: **Pro 권장** — 무료는 1주 무요청 시 일시정지 + 자동 백업 없음. dev는 무료 유지(같은 조직이면 dev 컴퓨팅 비용도 붙으므로 조직 분리 검토)
- Vercel: Hobby는 비상업 전용 → 출시 시 **Pro** 전환
- 분리 작업 자체는 무료로 진행 가능

---

## 2. 현재 상태 조사 결과 (2026-11-04)

### 마이그레이션 이력이 두 개
- kend `app/sql/migrations` (0000~0033)와 kend-seller `app/sql/migrations` (0000~0013)가 **같은 DB에 각자 drizzle migrate**를 실행해 왔음 (둘 다 기본 `drizzle.__drizzle_migrations` 테이블)
- → 빈 DB에 마이그레이션 파일을 재실행해서는 현재 스키마 재현을 보장할 수 없음. **prod는 지금 DB의 스키마 덤프로 만든다** (B단계)
- 마이그레이션 외 수동 적용 SQL: kend `app/sql/functions`·`triggers`, seller `app/sql/triggers`·`views` — 덤프에 포함되므로 별도 재실행 불필요, 덤프 후 대조만

### Supabase 프로젝트에 딸린 것 (DB 외)
| 종류 | 항목 |
|------|------|
| Storage 버킷 | `profiles`, `reviews` (kend) / `products`, `sellers` (seller) — 정책 14개 |
| Edge Function | `create-naver-user` (kend, Secret: `SITE_URL`) / `sync-tracking` (seller, 배송추적) |
| pg_cron (6개) | `expire-pending-orders`, `expire-unconfirmed-orders`, `expire-unshipped-orders`, `auto-confirm-purchase` (kend) / `calculate-monthly-settlements`, `sync-tracking-status` (seller — **dev 주소 하드코딩** + Vault `service_role_key`로 인증) |
| pg_cron 미등록 | `process-approved-returns` (URL·시크릿 플레이스홀더 상태) |
| Vault | `service_role_key` 1건 (`sync-tracking-status` 크론이 사용) |
| Auth | Site URL, Redirect URLs, Provider 4종(Google/Kakao/Apple/Naver는 Edge Function 경유), `auth.users` 트리거 `user_to_profile_trigger` |
| 확장 | `pg_cron`, `pg_net`, `pgcrypto`, `uuid-ossp`, `supabase_vault` |

- 성장 기준값은 DB 테이블이 아님 (복사 대상 아님)
- **보안 이슈 (E단계에서 수정)**: `sellers`·`products` 버킷 정책이 "authenticated 누구나" UPDATE/DELETE 허용 → 구매자 계정으로 판매자 로고·상품 이미지 삭제 가능. `reviews` 삭제·업로드 정책은 대상 role이 `public`

### Vercel kend 환경변수
| 변수 | Production | Preview | Development |
|------|:-:|:-:|:-:|
| Supabase 6종 + `DATABASE_PASSWORD` | ✅ | ✅ | ✅ (세 환경 동일 값) |
| `REDIRECT_LOGIN_URL`, `NAVER_CLIENT_ID/SECRET` | ✅ | ✅ | ✅ |
| `VITE_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` | ✅ | ❌ | ❌ |
| `KAKAO_REST_API_KEY` | ✅ | ❌ | ❌ |
| `CRON_SECRET` | ❌ | ❌ | ❌ |

- Preview에 Toss·카카오 키 없음 → 개발 서버에서 결제·"현재 위치로 주소 찾기" 불가
- `CRON_SECRET` 없음 → `/api/cron/process-returns`가 항상 401 ([process-returns-cron.ts](../../app/features/orders/pages/process-returns-cron.ts)). prod 크론 등록 전 필수
- kend-seller Vercel 환경변수는 미확인 (seller 단계에서 확인)

### URL이 박혀 있는 곳 (`kend-seven.vercel.app`)
- kend-native `app/index.tsx` (`WEB_APP_URL`, `KEND_HOST`) — **앱 빌드 필요**
- Supabase Site URL / Redirect URLs, 소셜 로그인 콘솔 4곳, Edge Function `SITE_URL`, 크론 URL, Toss 상점관리자 사이트 URL, App Store Connect URL

### 남아 있는 임시 코드
- `app/common/pages/home-page.tsx` — `?code=` 받아서 `exchangeCodeForSession` (Site URL 하나 문제 우회용)

---

## 3. 실행 단계

> 각 단계 착수 시 세부 체크리스트를 이 문서에 추가. 완료 표시는 실제 동작 확인 후에만.

### A. 사전 준비 (사용자)
- [x] 도메인 구매 — `kend.co.kr`
- [x] `vercel login` 재인증
- [ ] Toss 상점관리자에서 **라이브 클라이언트/시크릿 키** 발급 확인
- [ ] 브랜치 정리 (`design-renewal` 삭제, `kend-newbuild` 용도 확인)

### B. prod Supabase 생성 + 스키마 복제
> 2026-11-04 진행: prod = `kend-prod` (`zweokwkresqbksjclxym`, 조직 `aidenotion` Free, Seoul, PG 17.11). 접속정보는 로컬 `.env.production`의 `PROD_DATABASE_URL`(Session pooler, gitignore). 도구: `brew install libpq`의 `pg_dump`/`psql`.
> 아래 "복제·대조 완료"는 dev와 구조 비교로 일치 확인까지 — 실제 앱 동작(가입·업로드 등) 확인은 C·D단계 이후.

- [x] 새 프로젝트 생성 — Free로 시작 → 출시 시 Pro (folio는 pause해 무료 한도 2개 확보)
- [x] 스키마 복원 — `pg_dump --schema-only --no-owner --no-privileges --schema=public --schema=drizzle` → `CREATE SCHEMA public` 줄 제거 → 단일 트랜잭션 복원. **복제·대조 완료**: 컬럼·제약·인덱스·트리거·함수·뷰·enum 598항목 diff 0, API grant 동일
- [x] `drizzle.__drizzle_migrations` 데이터 63건 복사 (해시 일치, 시퀀스 63) — **복제·대조 완료**
- [x] auth 트리거 `user_to_profile_trigger` 등록 (`public.handle_new_user()`로 스키마 명시 필요했음) — 가입 동작 테스트 대기
- [x] 기준 데이터 복사: `domains`(2), `system_options`(2), `main_categories`(5), `sub_categories`(35) — UUID 유지, 행 해시 일치. 제외: hashtags(판매자 데이터), notices(테스트 글), 나머지 사용자·주문 데이터. `common_codes`·`platform_settings`는 dev에도 비어 있음
- [x] Storage 버킷 4개 + 정책 14개 — **복제·대조 완료** (파일은 미복사), 업로드 동작 테스트 대기
- [x] 확장 `pg_cron`, `pg_net` 활성화 — dev와 확장·스키마 일치
- [x] **`create-naver-user` 보안 수정 + 새 키 전환** (2026-11-05, dev 배포 완료) — 예전 함수는 body의 email을 그대로 믿어 anon 키만으로 남의 계정 magic link 발급 가능했음. 이제 secret 키(`apikey` 헤더)만 호출 가능 + 네이버 토큰으로 프로필 직접 조회. 소스는 `supabase/functions/create-naver-user/`로 이동, `supabase/config.toml`에 `verify_jwt=false`. dev에서 공격 시나리오 5종 거부 확인 ✅ / **정상 네이버 로그인은 Preview에서 테스트 대기**
- [x] kend 코드 새 키 전환 + supabase-js 2.118 / ssr 0.12 — dev에서 로그인·조회·회원탈퇴 확인 ✅ / 반품환불(secret 키) 경로는 F단계에서 확인
- [x] Edge Function prod 배포 (2026-11-09): `create-naver-user`, `sync-tracking` + 함수 시크릿 `SITE_URL=https://kend.co.kr`, `SWEETTRACKER_API_KEY` — 공격 시나리오 거부·secret 키 호출 200 확인 ✅
- [x] prod Vault `secret_key`·`project_url` 등록 (사용자) — 값 해시 대조 ✅
- [x] prod 크론 6개 등록 (2026-11-09) — DB함수 크론 5개는 dev 정의 복사, `sync-tracking-status`는 seller 마이그레이션 파일로. dev와 정의 diff 0 ✅, 크론 명령·DB함수 각 1회 실행 정상 ✅. `supabase_migrations.schema_migrations` 생성 + seller 마이그레이션 3건 기록 (이후 `supabase db push` 중복 방지)
- [ ] `process-approved-returns` 크론 — 도메인 연결 + Vercel `CRON_SECRET` 후 (C·D단계)
- [x] **seller 새 키 전환** (2026-11-09, seller `development` 브랜치 `89d2ccb`) — `sync-tracking` secret 키만 허용(기존엔 anon으로도 호출 가능) + `verify_jwt=false`, 크론 마이그레이션 `20261105000000_tracking_sync_cron_secret_key` (Vault `project_url`·`secret_key` 사용 → dev·prod 같은 SQL). dev: 함수 배포·크론 적용·크론 명령 실행 200 확인 ✅
- [x] dev secret 키 교체 (2026-11-09) — Vault 확인 과정에서 키가 노출돼 새 키 발급 + 예전 키 삭제
- [ ] dev 정리: 안 쓰게 된 함수 시크릿 `PROJECT_URL`·`SERVICE_ROLE_KEY`, Vault `service_role_key`(legacy) 삭제 — dev legacy 키 비활성화 때 함께

### C. 도메인 + prod 로그인 설정
- [ ] Vercel kend Production에 `kend.co.kr` 연결, 가비아 DNS 설정 (SSL 발급 대기 고려해 일찍)
- [ ] prod Supabase Auth: Site URL `https://kend.co.kr`, Redirect URLs `https://kend.co.kr/**`
- [ ] 소셜 로그인 콘솔에 prod 콜백 추가: Google, Kakao, Apple(Service ID 도메인·Return URL, `scripts/generate-apple-secret.cjs`로 시크릿), Naver
- [ ] dev Supabase(지금 프로젝트): Site URL → `http://localhost:5173`, Redirect URLs에 localhost + development 브랜치 Preview URL
- [ ] Vercel Preview **Deployment Protection** 확인 — 켜져 있으면 OAuth 콜백·WebView가 막힘
- [ ] 임시 코드 제거: `home-page.tsx`의 `?code=` 처리 (prod·dev 양쪽 소셜 로그인 확인 후)

### D. 환경변수 전환 + 브랜치
- [x] `development` 브랜치 생성 (2026-11-05, 아직 push 전)
- [ ] Vercel kend **Production**: Supabase 6종 + `DATABASE_PASSWORD` → prod 값, `REDIRECT_LOGIN_URL=https://kend.co.kr`, **Toss 라이브 키**, `CRON_SECRET` 추가
- [ ] Vercel kend **Preview**: Supabase → dev 값(지금 값 유지), `REDIRECT_LOGIN_URL` → development 브랜치 URL, Toss **테스트** 키·`KAKAO_REST_API_KEY`·`CRON_SECRET` 추가
- [ ] 로컬 `.env`: dev 유지. prod 마이그레이션용 `.env.production`(gitignore) + 실행 스크립트 분리
- [ ] `package.json` `db:typegen`의 하드코딩 project-id 정리
- [ ] **kend-seller** (별도 승인): Vercel Production/Preview 동일 방식, `seller.kend.co.kr` 연결, `development` 브랜치
- [ ] **kend-native** (별도 승인): `WEB_APP_URL`·`KEND_HOST` → `kend.co.kr`, 개발 빌드는 개발 서버를 보도록 분기 검토

### E. RLS
- [ ] dev에서 전체 테이블(~33개) 정책 작성 → kend·seller 전 흐름 테스트 (전수점검 쿼리: [kend-error-handling-roadmap](kend-error-handling-roadmap.md) 1-5)
- [ ] Storage 정책 보정 — `sellers`·`products` UPDATE/DELETE를 소유 판매자로 제한, `reviews` 정책 role `public` → `authenticated`
- [ ] prod 적용 + 같은 흐름 재확인
- [ ] 인덱스 정의 (milestones P4-3 잔여)

### F. 라이브 결제 검증
- [ ] confirm 실패 시 Toss 결제 자동 취소(void) 처리 (milestones P4-3 결제-주문 무결성 2번)
- [ ] prod에서 실기기·실카드 소액 결제 → 주문 → 취소/환불 한 사이클
- [ ] Toss 상점관리자 사이트 URL → `kend.co.kr` 변경 요청
- [ ] (가상계좌 도입 시) Toss 웹훅 라우트 신설 + 등록 — 현재 카드 confirm 흐름만이라 지금은 불필요

### G. 메일 발송
- [ ] 운영 메일 발송 서비스(Resend 등) 가입 → `kend.co.kr` 도메인 인증 → prod Supabase Auth 커스텀 SMTP 연결 (Supabase 기본 SMTP는 발송량 제한·팀 멤버 주소로만 발송 — 착수 시 현행 정책 재확인)
- [ ] 비밀번호 재설정 메일 실수신 확인

---

## 4. 운영 규칙 (분리 이후)

- 스키마 변경: **dev에 `db:migrate` → 확인 → prod에 적용** (prod 실행은 별도 스크립트로만)
- kend와 seller 마이그레이션이 같은 이력 테이블을 공유 — 양쪽에서 동시에 스키마를 바꾸지 않도록 순서 조율
- 더미·시드 데이터는 dev에만
- prod 직접 쿼리는 읽기만, 수정은 마이그레이션으로
- Vercel 환경변수 추가 시 Production/Preview 각각 어떤 값을 넣을지 이 문서 표에 함께 갱신
