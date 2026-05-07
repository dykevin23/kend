# clientLoader 캐시 — 나머지 라우트 펼치기

> 2026-05-07 작성  
> iOS swipe back UX 개선 작업의 후속. 현재 `/stores`, `/stores/:storeId`에만 적용됨.

---

## 배경

- 2026-05-07에 `app/lib/with-client-cache.ts`의 `makeCachedClientLoader<T>()` 헬퍼로 URL 단위 캐시 도입
- swipe back 시 React Router의 single fetch가 매번 loader를 재실행 → from-route(B)가 잠깐 보이고 GlobalLoadingBar가 뜨는 UX 문제
- `clientLoader`로 캐시하면 동일 URL 재진입 시 loader 도는 단계 없이 즉시 복귀
- 자세한 분석은 [changelog-kend.md 2026-05-07 항목](../changelog-kend.md) 참고

---

## 적용 상태

### 적용 완료
- `/stores` — `features/stores/pages/stores-page.tsx`
- `/stores/:storeId` — `features/stores/pages/store-page.tsx`

### 미적용 (이번 후속 작업 대상)

#### 저위험 (loader가 사용자 mutable 데이터 안 다룸 — 캐시 그대로 적용 가능)

| 라우트 | 파일 | 비고 |
|---|---|---|
| `/` | `common/pages/home-page.tsx` | loader 확인 필요 |
| `/myPage/notices` | `features/users/pages/notices-page.tsx` | 정적 공지 |
| `/myPage/support` | `features/users/pages/support-page.tsx` | 정적 |
| `/myPage/terms` | `features/users/pages/terms-page.tsx` | 정적 |
| `/myPage/privacy` | `features/users/pages/privacy-page.tsx` | 정적 |
| `/terms` (root) | `common/pages/terms-page.tsx` | 정적 |
| `/privacy` (root) | `common/pages/privacy-page.tsx` | 정적 |
| `/search` | `features/search/pages/search-page.tsx` | URL search params 단위 캐시 OK |

#### 고위험 (mutation 발생 — 캐시 무효화 인프라 필요)

| 라우트 | 파일 | 무효화 트리거 |
|---|---|---|
| `/products/:productId` | `features/products/pages/product-page.tsx` | 좋아요 토글, 장바구니 담기 |
| `/likes` | `features/likes/pages/likes-page.tsx` | 좋아요 토글 |
| `/carts` | `features/carts/pages/shopping-cart-page.tsx` | 수량 변경/삭제, 결제 완료 |
| `/myPage` | `features/users/pages/my-page.tsx` | 프로필 수정, 자녀 추가 등 |
| `/myPage/addresses` | `features/users/pages/addresses-page.tsx` | 배송지 추가/수정/삭제 |
| `/myPage/profile/edit` | `features/users/pages/edit-profile-page.tsx` | 폼 페이지 — 캐시 의미 작음 |
| `/myPage/recent-products` | `features/users/pages/recent-products-page.tsx` | 상품 조회 시 변경 |
| `/myPage/notifications` | `features/users/pages/notifications-page.tsx` | 알림 수신/읽음 처리 |
| `/orders` | `features/orders/pages/orders-page.tsx` | 주문 생성/취소 |
| `/children` (overview) | `features/children/layouts/children-overview-layout.tsx` | 자녀 추가/수정/삭제 |
| `/children` index | `features/children/pages/children-index-page.tsx` | 동상 |
| `/children/:childId` | `features/children/pages/children-page.tsx` | 성장기록 추가 등 |

---

## 작업 순서 제안

### 1단계: 저위험 라우트 일괄 적용 (30분)
- 각 파일에 `loader` + `clientLoader` 두 줄 추가
- 동일 시나리오로 회귀 테스트

### 2단계: 캐시 무효화 인프라 설계 (1-2시간)
- `makeCachedClientLoader`에 `invalidate(key?: string)` 또는 외부 무효화 API 추가
  - 예: 헬퍼가 cache Map과 invalidate 함수를 함께 반환
  - 또는 전역 EventEmitter로 라우트 키 기반 broadcast
- 각 mutation(action)에서 영향 받는 라우트의 캐시 무효화
  - 좋아요 토글 → 해당 상품 페이지, `/likes` 무효화
  - 장바구니 변경 → `/carts` 무효화
  - 프로필 수정 → `/myPage` 무효화
- 트리거 누락 검증 절차 필요 (수동 테스트 시나리오 정리)

### 3단계: 고위험 라우트 적용 (1시간)
- 1단계 패턴 + 무효화 호출 함께 적용
- 시나리오별 회귀 테스트 (mutation 후 stale 데이터 노출 안 되는지)

### 4단계 (장기): `unstable_dataStrategy` 도입 검토
- 현재 라우트별 export 보일러플레이트를 `entry.client.tsx`의 한 지점으로 중앙화 가능
- `unstable_` prefix → React Router 메이저 업데이트 시 리스크 있어 출시 후 안정화 시점에 검토
- 도입하면 라우트별 opt-in/opt-out 정책을 한 곳에서 관리 가능

---

## 회귀 테스트 시나리오 (적용 라우트별 공통)

각 라우트를 도착지로 하는 swipe back에서 확인:

1. **기본 UX**: A → B → swipe back → 로딩 인디케이터 없이 부드럽게 A 복귀
2. **mutation 후 데이터 갱신** (고위험 라우트만): 
   - A에서 데이터 표시 확인
   - A → B → mutation 발생 → A 복귀 → 변경된 데이터 반영 확인
3. **다른 사용자 컨텍스트**: 로그아웃 → 다른 계정 로그인 → 이전 사용자 캐시 안 보이는지

---

## 참고

- 헬퍼: [app/lib/with-client-cache.ts](../../app/lib/with-client-cache.ts)
- 적용 예시: [app/features/stores/pages/stores-page.tsx](../../app/features/stores/pages/stores-page.tsx), [store-page.tsx](../../app/features/stores/pages/store-page.tsx)
- React Router v7 `clientLoader` 문서: https://reactrouter.com/start/framework/data-loading#client-loaders
