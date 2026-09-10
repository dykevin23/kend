# KEND 환경 분리 계획 (Supabase Dev/Prod)

> **목표**: 개발/운영 환경을 분리하여 프로덕션 DB를 보호하고, 로컬 개발 시 소셜 로그인 등 전체 기능을 테스트 가능하게 한다.  
> **상태**: 출시 전후 진행 예정

---

## 현재 문제

### Supabase 프로젝트가 1개 (dev/prod 공용)

- 개발 중 생성된 테스트 데이터(주문, 더미 성장기록 등)가 프로덕션 DB에 존재
- **Site URL이 하나**라서 환경별 분기 불가
  - Production에 맞추면(`kend-seven.vercel.app`) → 로컬에서 소셜 로그인 콜백 실패
  - localhost에 맞추면 → 프로덕션 앱에서 소셜 로그인 콜백 실패
- Redirect URLs에 localhost와 vercel.app이 혼재

### 현재 임시 처리

Supabase Site URL을 프로덕션(`https://kend-seven.vercel.app`)으로 설정한 상태에서,
OAuth PKCE flow가 `redirectTo` 파라미터를 무시하고 **Site URL(/) 기준으로 `?code=xxx`를 보내는** 문제가 발생.

**임시 대응**: `app/common/pages/home-page.tsx`에서 `?code=` 파라미터가 있으면 `exchangeCodeForSession`으로 세션 교환 후 `/stores`로 redirect.

이 코드는 Supabase 프로젝트 분리 후 제거 예정.

---

## 환경 분리 계획

### 구조

| 환경 | Supabase 프로젝트 | Site URL | Vercel | 용도 |
|------|-------------------|----------|--------|------|
| Local | kend-dev | `http://localhost:5173` | - | 로컬 개발 |
| Production | kend-prod | 실 도메인 | Production | 실 서비스 |

### 분리 시 필요한 작업

#### 1. Supabase Dev 프로젝트 생성
- 새 프로젝트 생성 (kend-dev)
- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/*`

#### 2. 스키마 동기화
- 현재 프로덕션의 migration 파일을 dev 프로젝트에 적용
- `npm run db:migrate` 실행 대상을 환경별로 분기
- RLS 정책 동기화

#### 3. Edge Function 배포
- `create-naver-user` Edge Function을 dev 프로젝트에도 배포
- Edge Function Secrets 설정 (`SITE_URL` 등)

#### 4. 환경변수 분리

**로컬 `.env` (dev)**
```
SUPABASE_URL=https://xxx-dev.supabase.co
SUPABASE_ANON_KEY=dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=dev_service_role_key
VITE_SUPABASE_URL=https://xxx-dev.supabase.co
VITE_SUPABASE_ANON_KEY=dev_anon_key
DATABASE_URL=dev_database_url
REDIRECT_LOGIN_URL=http://localhost:5173
```

**Vercel Production**
```
SUPABASE_URL=https://xxx-prod.supabase.co
SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key
VITE_SUPABASE_URL=https://xxx-prod.supabase.co
VITE_SUPABASE_ANON_KEY=prod_anon_key
DATABASE_URL=prod_database_url
REDIRECT_LOGIN_URL=https://실도메인
```

#### 5. OAuth Provider 설정
- Google/Kakao/Naver 각 provider에 dev/prod 콜백 URL 등록
- dev Supabase: `http://localhost:5173` 기반 콜백
- prod Supabase: 실 도메인 기반 콜백

#### 6. 임시 코드 제거
- `home-page.tsx`의 `?code=` 처리 로직 제거
- `social-complete-page.tsx`의 디버그 로그 제거

#### 7. 프로덕션 DB 정리
- 테스트 데이터 삭제 (더미 children, 테스트 주문 등)
- 테스트 계정 정리

### 운영 규칙

- **스키마 변경은 항상 migration 파일 기반** → dev에서 작성/테스트 → prod에 적용
- **seed 데이터(더미)는 dev에서만** 사용
- **prod DB에 직접 쿼리는 최소화** (읽기만, 수정은 migration으로)

---

## 현재 운영 방식 (분리 전)

- Supabase Site URL: `https://kend-seven.vercel.app` (프로덕션 기준)
- 로컬 개발 시 소셜 로그인: home-page.tsx 임시 처리로 동작
- 로컬 개발 시 이메일/비밀번호 로그인: 정상 동작
- 데이터: dev/prod 공용 (주의 필요)

---

*작성일: 2026-04-14*
