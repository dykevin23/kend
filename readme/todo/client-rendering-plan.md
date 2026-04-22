# KEND 클라이언트 렌더링 전환 계획

> **목표**: SSR loader 의존으로 인한 페이지 전환 지연을 해소하고, 네이티브 앱에 가까운 반응 속도를 확보한다.  
> **상태**: 장기 계획 (출시 후 점진적 전환)

---

## 현재 문제

KEND는 React Router SSR(loader/action) 구조로, 모든 페이지 이동 시:

```
링크 클릭 → 서버 요청 → loader 실행(Supabase 쿼리) → HTML 렌더 → 응답 → 화면 전환
```

- 네트워크 왕복이 2번 발생 (브라우저→서버, 서버→Supabase)
- KEND는 WebView 내 인증된 사용자 전용 앱이므로 SSR의 주요 이점(SEO, 초기 렌더링)이 사실상 불필요
- 체감 속도가 느려 "눌렸는지 모르겠다" UX 문제 발생

---

## 해결 전략 (단계별)

### Phase 0 — Link Prefetch 적용 (즉시)

React Router `<Link prefetch="intent">`로 **사용자가 링크에 터치하는 순간** loader를 미리 호출.  
클릭 시점에는 데이터가 준비되어 있어 즉시 전환.

- 적용 대상: BottomNavigation, 상품 카드, 주요 네비게이션 Link
- 작업량: 소 (기존 Link에 props 추가)
- 효과: 체감 속도 개선 (서버 경유는 유지되지만 대기 시간 제거)

### Phase 1 — React Query 도입 + 조회 클라이언트 전환 (출시 후)

React Query(TanStack Query)를 도입하여 데이터 조회를 클라이언트 사이드로 전환.

**변경 구조:**

| | 현재 | 전환 후 |
|---|---|---|
| Read (조회) | `loader` (서버) + `useLoaderData` | `useQuery` + `browserClient` (클라이언트) |
| CUD (변경) | `action` + `useFetcher` (서버) | `action` + `useFetcher` 유지 또는 `useMutation` |
| 서버 경유 | 매번 | action만 |
| 캐싱 | 없음 | 자동 (stale-while-revalidate) |

**핵심 변경점:**
- `loader`에서 Supabase 쿼리 제거 → `useQuery` + `browserClient`로 이동
- `loader`는 인증 체크 / redirect 가드 역할만 유지
- `action`은 서버에서 그대로 유지 (데이터 변경은 서버가 안전)
- `browserClient`가 이미 `supa-client.ts`에 존재하므로 쿼리 함수 재사용 가능

**React Query 선택 이유 (vs clientLoader):**
- 캐싱, stale 관리, 백그라운드 refetch, 자동 무효화가 내장
- 동일 데이터를 여러 컴포넌트에서 공유 (예: 장바구니 개수)
- 로딩/에러 상태 관리 편의
- clientLoader로 캐싱을 직접 구현하면 결국 React Query를 재발명하는 것

**전환 방식:**
- 페이지 단위 점진적 전환 가능 (전체 일괄 전환 불필요)
- 체감이 느린 주요 페이지부터 우선 적용:
  1. 스토어 목록 (`/stores`)
  2. 상품 상세 (`/stores/:productId`)
  3. 자녀 목록/상세 (`/children`)
  4. 장바구니 (`/carts`)
  5. 나머지 페이지

---

## 참고

- React Router clientLoader 문서: https://reactrouter.com/how-to/client-data
- TanStack Query: https://tanstack.com/query

---

*작성일: 2026-04-10*
