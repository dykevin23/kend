# 데이터 신선도 / 캐싱 정책 로드맵

> 2026-09-08 작성 · 2026-09-09 결정 반영
> [../archive/client-loader-cache-rollout.md](../archive/client-loader-cache-rollout.md)의 캐싱 부분을 대체(supersede)한다.
> 기존 문서는 캐시를 "swipe back UX" 관점으로만 봤고, "데이터 신선도" 관점이 빠져 있었다.
> 최종 지향점(React Query)은 [client-rendering-plan.md](./client-rendering-plan.md) 유지.

---

## 계기

앱(WebView)에서 스토어 목록이 며칠째 갱신 안 됨. 원인:

- `/stores`, `/stores/:storeId`에 `makeCachedClientLoader`가 URL 단위 **영구 캐시**를 건다 (TTL 없음, forward 네비게이션 무효화 없음).
- 캐시 `Map`은 JS 컨텍스트(문서) 수명 동안 유지된다.
- 웹: 강제 새로고침 = 문서 리로드 = 캐시 `Map` 재생성 → 최신. (링크 이동만 하면 웹도 stale)
- 앱: [kend-native/app/index.tsx](../../kend-native/app/index.tsx)가 웹앱을 WebView에 **딱 한 번** 로드하고 이후 전부 SPA 클라 네비게이션 → 캐시 `Map`이 앱 세션 내내(며칠도) 유지 → `/stores` 영원히 stale.

부수 확인: 나머지 ~24개 라우트는 캐시 없이 **매 이동마다 서버 loader 재실행**(React Router 기본 동작). 메뉴 이동 시 로딩 지연의 대부분은 WebView→Vercel(콜드스타트 가능)→Supabase 왕복 시간. 스토어 쿼리 자체는 안 무겁다(상품 18개, 셀러 4개) — `/stores`가 특별히 느린 게 아니라 모든 티어 A 페이지가 같은 왕복 비용을 문다.

---

## 핵심 인식: 문제가 2개다

| 문제 | 증상 | 올바른 해결 위치 |
|---|---|---|
| **A. 뒤로가기 잔상** | swipe back 시 이전 화면 깜빡 + GlobalLoadingBar | **렌더링 레이어** — RR은 revalidation 중에도 기존 `useLoaderData`를 유지한다. 페이지가 "재조회 중 스켈레톤을 안 띄우게"만 하면 캐시 없이도 깜빡임 없음 |
| **B. 데이터 신선도** | 스토어 목록이 며칠째 그대로 | **재조회 기준 정의** — 언제 loader를 다시 돌릴지 |

현재 캐시는 A를 풀려고 B를 통째로 포기한 구조다. 둘을 분리한다.
**A는 렌더링 레이어(Phase 3)에서, B는 재조회 기준(아래)으로.**

---

## 정책: 클라이언트 캐시를 두지 않는다

**결정 ① (2026-09-09): 최소 캐시 — `makeCachedClientLoader` 완전 삭제.**

| 구분 | 대상 | 처리 |
|---|---|---|
| **항상 신선** | loader가 있는 모든 페이지 | 캐시 안 함. RR 기본 동작(매 navigation마다 loader 재실행). 재조회 중 기존 데이터 유지 → 깜빡임 없음(Phase 3) |
| **정적** | loader가 아예 없는 페이지 (약관/개인정보 등 JSX만) | 캐시할 게 없음 — 특별 처리 불필요 |

기각된 대안:
- **광범위 캐시 + 무효화 인프라** (기존 rollout 문서): mutation마다 올바른 캐시 키를 무효화해야 정확 → fragile, 버그 표면적 큼. 문서 자신도 "트리거 누락 검증 절차 필요"라고 명시.
- **React Query 즉시 도입**: 공수 크고 출시 일정 영향. Phase 6(장기)으로.

`/myPage/notices`·`/support`도 DB에서 읽으면(공지는 관리자가 올리면 바뀜) "항상 신선"이 맞다. 진짜 "정적"은 loader 없는 페이지뿐.

### 왜 `/stores`조차 캐시 안 해도 되나

- 캐시가 사려던 유일한 이득 = "떠났다가 짧은 시간 안에 재진입 시 왕복 1회 생략". 스토어 쿼리는 안 무겁고, 왕복 비용은 모든 페이지 공통.
- 캐시의 존재 이유(뒤로가기 깜빡임)는 Phase 3에서 사라짐.
- 하단 네비에 이미 `prefetch="intent"` — 탭 터치 순간 loader 선실행.
- 캐시는 stale 버그 클래스를 다시 연다(지금 없애려는 그 문제).
- 나중에 프로파일링해서 정말 느린 페이지가 있으면 React Query `staleTime`으로 외과적으로. 손으로 만든 TTL Map 말고.

---

## 메뉴별 확인 (전부 "항상 신선")

참고용 — 정책이 단일하므로 표는 "왜 캐시하면 안 되는지" 근거 기록.

### 하단 네비게이션

| 메뉴 | 라우트 | 근거 |
|---|---|---|
| 스토어 | `/stores` | seller 상품 추가/토글 반영 필요. 쿼리 가벼움. (이번 stale 버그의 현장) |
| 성장기록 | `/children` (+layout) | 본인이 이 흐름에서 자녀 추가/수정 → 즉시 반영 |
| 좋아요 | `/likes` | 상품·스토어 상세에서 하트 토글하고 오면 즉시 반영돼야 |
| 마이페이지 | `/myPage` | 주문수·리뷰수 카운트가 최근 활동 반영 |

### 헤더 / 전역

| 검색 | `/search?q=` | 현재 카탈로그 반영 |
| 장바구니 | `/carts` | 담기/수량/삭제 매번 |
| root loader | (전역) | `shouldRevalidate`로 pathname 변경 시 억제 유지. 단 포그라운드 시 강제 revalidate 추가 (세션 만료·타기기 장바구니 변경 대비) |

### 하위 페이지

| 라우트 | 근거 |
|---|---|
| `/stores/:storeId` | 상품 목록·isLiked. 기존 `clientLoader.invalidate` + `revalidate` 패턴은 캐시 제거하면서 단순 `revalidate`로 정리 |
| `/products/:productId` | 가격·재고·리뷰 최신이 구매 판단에 직결 |
| `/orders`, `/orders/:orderGroupId` | 배송상태가 서버측(판매자 발송, 배송 진행, 환불 크론)에서 바뀜 |
| `/myPage/inquiries`, `/inquiries/:id`, `/inquiries/new` | 판매자 답변이 서버측에서 달림 |
| `/myPage/reviews` | 작성/수정 반영 |
| `/myPage/recent-products` | 상품 볼 때마다 바뀜 |
| `/myPage/notifications` | 최신 필수 |
| `/myPage/addresses` | 추가/수정/삭제 반영 |
| `/myPage/profile/edit` | 폼 페이지 |
| `/children/:childId`, `/:childId/edit`, `/:childId/growth`, `/submit` | 성장기록 추가가 이 화면 흐름 |
| `/payments/success`, `/fail` | 일회성 |
| `/myPage/notices`, `/support` | DB 조회 시 관리자 갱신 반영 필요 → 항상 신선 |
| `/terms`, `/privacy`, `/refund-policy` | loader 없으면 정적, 캐시 무관 |
| `/`, `/children` index | redirect |

---

## 앱 생명주기 기준 (핸드폰 잠금 후 재개)

**결정 ② (2026-09-09): T1 = 30초, T2 = 30분.**

`visibilitychange`(`document.visibilityState`) + 네이티브 `AppState` 브리지로 포그라운드 감지.
백그라운드에 있던 시간(`awayMs`) 기준:

| 자리 비운 시간 | 동작 |
|---|---|
| **< 30초** | 아무것도 안 함 (알림 확인하고 바로 복귀) |
| **30초 ~ 30분** | 현재 라우트 `revalidator.revalidate()`. 화면은 기존 데이터 유지하며 백그라운드 갱신 |
| **≥ 30분 / 콜드스타트** | 현재 라우트 재조회 + root loader까지 revalidate. 사실상 앱 새로 켠 것과 동일 |

- root loader(세션·장바구니 개수)는 30초 이상이면 포그라운드 재조회 대상.
- 숫자는 운영하며 조정 가능. 대부분 커머스 앱이 이 근처.

예시 (T1=30초 / T2=30분):

| 상황 | 자리 비운 시간 | 결과 |
|---|---|---|
| 카톡 답장하고 복귀 | 15초 | 그대로 |
| 다른 앱 찾아보고 옴 | 3분 | 현재 화면만 갱신 |
| 점심 먹고 옴 | 1시간 | 전체 갱신 |
| 어제 보다 오늘 다시 엶 | 12시간 | 전체 갱신 |

---

## 구현 로드맵

### Phase 1 — 캐시 제거 (반나절)
- `/stores`, `/stores/:storeId`에서 `clientLoader` export 제거
- `store-page.tsx`의 `clientLoader.invalidate(...)` 호출 → 단순 `revalidator.revalidate()`로 정리
- [app/lib/with-client-cache.ts](../../app/lib/with-client-cache.ts) 삭제
- 회귀 테스트: 두 화면 정상 조회, swipe back 동작 (Phase 3 전이라 깜빡임은 남아있을 수 있음 — Phase 3에서 해결)

### Phase 2 — 뒤로가기 잔상 제거 (렌더링 레이어) (1일) ★ 핵심
- 각 페이지의 로딩 스켈레톤/스피너가 **최초 로드에만** 뜨고 revalidation 중엔 기존 데이터 유지하도록 점검
- 판단 기준: `useLoaderData()` 값 존재 여부로 분기. `useNavigation().state === "loading"`만 보고 스켈레톤 띄우면 안 됨 (revalidation도 loading 상태)
- `GlobalLoadingBar`(root, 200ms delay)는 유지 — 이건 subtle해서 OK
- 완료 시 캐시 없이도 swipe back / 탭 전환이 부드럽게 (이전 데이터 즉시 표시 + 백그라운드 갱신)

### Phase 3 — 앱 포그라운드 revalidation (1일, kend + kend-native)
- **kend**: root에 `useForegroundRevalidation()` 훅
  - `visibilitychange` 리스너, `hidden` 시 타임스탬프 기록, `visible` 시 `awayMs` 계산
  - 30초~30분: `revalidator.revalidate()`
  - 30분 이상: `revalidator.revalidate()` (root 포함)
  - `window.__kendOnForeground` 전역 함수로도 노출 (네이티브 브리지용)
- **kend-native**: [index.tsx](../../kend-native/app/index.tsx)에 `AppState` change 리스너 → `active` 전환 시 `webViewRef.injectJavaScript("window.__kendOnForeground?.(); true;")`
  - WebView `visibilitychange` 신뢰도가 플랫폼별로 낮은 케이스 대비 (양쪽 다 걸어두고 훅에서 중복 호출 디바운스)
- 회귀 테스트: 백그라운드 → (35초 / 25초 / 40분) 후 복귀 각각 동작 확인

### Phase 4 — 당겨서 새로고침 (선택, 1일)
- 현재 [index.tsx](../../kend-native/app/index.tsx)의 `bounces={false}` / `overScrollMode="never"`와 상충
  - iOS: `pullToRefreshEnabled` + `bounces={true}` 필요 (세로 bounce가 다시 생김 — 트레이드오프)
  - Android: 별도 처리
- 또는 웹 상단 커스텀 구현 (스크롤 top에서 touchmove 감지)
- 동작: 현재 라우트 강제 `revalidate()`
- **Phase 3가 대부분의 stale 시나리오를 커버하므로 후순위** — "능동적으로 새로고침하고 싶을 때"의 보조 수단

### Phase 5 (장기) — React Query
- [client-rendering-plan.md](./client-rendering-plan.md)대로. 조회를 `browserClient` + `useQuery`로 점진 전환
- 이 정책이 그대로 매핑: 대부분 `staleTime: 0` + `refetchOnWindowFocus`, 프로파일링해서 정말 느린 특정 쿼리만 `staleTime` 부여
- `refetchOnWindowFocus`가 Phase 3의 포그라운드 훅을 대체

---

## 검증 시나리오

1. **기본 조회**: 각 라우트 진입 시 최신 데이터 표시
2. **mutation 후 갱신**: A에서 값 확인 → B 이동 → mutation → A 복귀(또는 재진입) → 반영 확인
3. **다른 사용자 컨텍스트**: 로그아웃 → 다른 계정 로그인 → 이전 사용자 데이터 안 보임
4. **뒤로가기 (Phase 2)**: `/likes` → 상품상세 → 하트 해제 → swipe back → `/likes`에서 즉시 빠짐 + 로딩 플래시 없음
5. **포그라운드 (Phase 3)**:
   - 백그라운드 35초 후 복귀 → 현재 화면 갱신 확인
   - 백그라운드 25초 후 복귀 → 갱신 안 함 확인
   - 백그라운드 40분 후 복귀 → 전체 갱신 확인

---

## 참고

- 삭제 대상 헬퍼: [app/lib/with-client-cache.ts](../../app/lib/with-client-cache.ts)
- 적용 라우트: [stores-page.tsx](../../app/features/stores/pages/stores-page.tsx), [store-page.tsx](../../app/features/stores/pages/store-page.tsx)
- 네이티브 WebView: [kend-native/app/index.tsx](../../kend-native/app/index.tsx)
- root `shouldRevalidate` / `GlobalLoadingBar`: [app/root.tsx](../../app/root.tsx) L105 부근
- React Router v7 데이터 로딩: https://reactrouter.com/start/framework/data-loading
