# [kend-native 전달] 결제 WebView 수정 — 빌드/배포 요청

> 2026-09-10
> **이 문서 하나만 보면 됩니다.** 다른 파일 참고 불필요.
> 코드는 이미 `kend-native/app/index.tsx`에 적용돼 있음 (아래 diff 참고, typecheck 통과).

---

## 1. 상황

앱에서 결제 테스트 중 발견된 3가지:

| # | 증상 | 원인 |
|---|---|---|
| 1 | 결제하기 → "문제가 발생했어요"(kend 에러화면)가 잠깐 뜨고 카드사 화면 등장, 깜빡임 여러 번 | 주문 생성 직후 kend가 loader를 재조회하는데 그 요청이 Toss로의 페이지 이동에 끊기며 에러 처리됨 → **kend 웹 수정** |
| 2 | 결제 취소 후 뒤로가기 → "이미 종료된 세션입니다" (소진된 Toss URL로 감). iOS 스와이프도 동일 | 뒤로가기 차단 대상에 외부 도메인(pay.toss.im)·결제 종료 랜딩 URL이 없었음 → **kend-native 수정** |
| 3 | 결제 리다이렉트 중 흰 화면 깜빡임 | kend↔Toss 문서 전환 사이 WebView 흰 화면, 로딩 오버레이가 300ms 지연이라 못 덮음 → **kend-native 수정** |

---

## 2. kend-native가 할 일

1. `git diff app/index.tsx`로 아래 §4 변경이 들어와 있는지 확인 (working tree에 이미 적용됨)
2. 커밋 & 푸시
3. **kend 웹이 먼저 재배포됐는지 확인** (안 됐으면 그거 먼저 — 1번 버그는 웹 수정이라 앱만 빌드하면 안 없어짐)
4. EAS 빌드 → TestFlight / 내부배포
5. §5 체크리스트대로 iOS·Android 테스트

그 외 손댈 파일 없음. `.md` 문서 수정 불필요. `app/index.tsx` 한 파일이 전부.

---

## 3. app/index.tsx 변경 요약 (개념)

- **뒤로가기 차단을 2종류로 분리**
  - `isPaymentFlowUrl` (결제/로그인 리다이렉트 구간): kend 아닌 모든 외부 도메인 + `/payments/*` + 쿼리에 `payment_success`/`payment_error`/`payment_cancelled` → **Android 하드웨어 back 조용히 무시** (Alert 없음), iOS 스와이프 비활성
  - `isFormFlowUrl` (입력 폼: `/auth/*`, `/children` 폼): 기존대로 Android 확인 Alert, iOS 스와이프 비활성
- **`justReturnedFromPaymentRef`**: kend가 URL 쿼리를 지운 뒤에도 "결제에서 막 돌아온 화면"임을 추적해 뒤로가기 계속 차단. 다른 화면(다른 pathname)으로 이동하면 해제
- **iOS back/forward 차단**: `onShouldStartLoadWithRequest`에서 현재 kend인데 back/forward로 결제 URL 향하면 `return false`. (Toss/카드사 화면 내부 뒤로가기는 안 건드림)
- **흰 화면 오버레이**: kend↔외부 http(s) 최상위 이동 시 즉시 로딩 오버레이(크림색+스피너) + 8초 안전 타임아웃. iframe·앱스킴은 제외

---

## 4. app/index.tsx 전체 diff (이미 적용됨 — 확인용)

```diff
@@ const WEB_APP_URL = "https://kend-seven.vercel.app";
+const KEND_HOST = "kend-seven.vercel.app";
+
+const isKendUrl = (url: string): boolean => {
+  try {
+    return new URL(url).hostname === KEND_HOST;
+  } catch {
+    return false;
+  }
+};
+
+const pathnameOf = (url: string): string => {
+  try {
+    return new URL(url).pathname;
+  } catch {
+    return "";
+  }
+};

@@ 뒤로가기 차단 패턴
-// 로그인/가입 플로우, 결제 콜백, 자녀 정보 입력 화면
-const BACK_BLOCKED_REGEX =
-  /^\/(auth|payments)(\/|$)|^\/children\/(submit|\d+\/(edit|growth))$/;
+// 로그인/가입 플로우, 자녀 정보 입력 화면 — 뒤로가면 입력 유실
+const FORM_FLOW_REGEX =
+  /^\/(auth)(\/|$)|^\/children\/(submit|\d+\/(edit|growth))$/;
+
+// 리다이렉트 구간(결제·소셜로그인) — 뒤로가면 소진된 세션/결제창/OAuth URL.
+// 확인 Alert 없이 조용히 무시. (외부 페이지엔 자체 취소/뒤로 UI 존재)
+const isPaymentFlowUrl = (url: string): boolean => {
+  try {
+    const parsed = new URL(url);
+    if (parsed.hostname !== KEND_HOST) return true;
+    if (parsed.pathname.startsWith("/payments/")) return true;
+    if (
+      parsed.searchParams.has("payment_success") ||
+      parsed.searchParams.has("payment_error") ||
+      parsed.searchParams.has("payment_cancelled")
+    )
+      return true;
+    return false;
+  } catch {
+    return false;
+  }
+};
+
+const isFormFlowUrl = (url: string): boolean => {
+  try {
+    return FORM_FLOW_REGEX.test(new URL(url).pathname);
+  } catch {
+    return false;
+  }
+};
+
-const isBackBlocked = (url: string): boolean => {
-  try {
-    const pathname = new URL(url).pathname;
-    return BACK_BLOCKED_REGEX.test(pathname);
-  } catch {
-    return false;
-  }
-};
+// iOS 스와이프 뒤로가기 비활성화 대상 (두 경우 모두)
+const isBackBlocked = (url: string): boolean =>
+  isPaymentFlowUrl(url) || isFormFlowUrl(url);

@@ Home() 상태 선언부
   const [backBlocked, setBackBlocked] = useState(false);
+  const currentUrlRef = useRef(WEB_APP_URL);
+  const wasExternalRef = useRef(false);
+  // kend가 ?payment_cancelled 등 쿼리를 제거한 뒤에도 뒤로가기 가드 유지용
+  const justReturnedFromPaymentRef = useRef(false);
+  const paymentReturnPathRef = useRef("");

@@ Android 하드웨어 back 핸들러
       const onBackPress = () => {
-        // Blacklist URL: 확인 Alert 표시
-        if (backBlocked) {
+        // 결제 리다이렉트 구간 / 결제에서 막 돌아온 직후 → 조용히 무시
+        if (
+          isPaymentFlowUrl(currentUrlRef.current) ||
+          justReturnedFromPaymentRef.current
+        ) {
+          return true;
+        }
+        // 입력 폼 구간: 확인 Alert
+        if (isFormFlowUrl(currentUrlRef.current)) {
           Alert.alert(
             "화면을 나가시겠습니까?",
             "입력 중인 내용이 사라질 수 있어요.",
             ...
           );
           return true;
         }
         if (canGoBack && webViewRef.current) {
           webViewRef.current.goBack();
           return true;
         }
         return false;
       };
-    }, [canGoBack, backBlocked])
+    }, [canGoBack])

@@ handleNavigationStateChange
   const handleNavigationStateChange = (navState: WebViewNavigation) => {
     setCanGoBack(navState.canGoBack);
-    setBackBlocked(isBackBlocked(navState.url));
+    currentUrlRef.current = navState.url;
+
+    if (!isKendUrl(navState.url)) {
+      wasExternalRef.current = true;
+    } else if (!navState.loading) {
+      if (wasExternalRef.current) {
+        wasExternalRef.current = false;
+        justReturnedFromPaymentRef.current = true;
+        paymentReturnPathRef.current = pathnameOf(navState.url);
+      } else if (
+        justReturnedFromPaymentRef.current &&
+        pathnameOf(navState.url) !== paymentReturnPathRef.current
+      ) {
+        justReturnedFromPaymentRef.current = false;
+      }
+    }
+
+    setBackBlocked(
+      isBackBlocked(navState.url) || justReturnedFromPaymentRef.current
+    );
   };

@@ handleShouldStartLoad
+  const overlaySafetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
+
   const handleShouldStartLoad = (request: ShouldStartLoadRequest) => {
     isBackForwardRef.current = request.navigationType === "backforward";
+
+    // kend에서 back/forward로 결제 리다이렉트 URL로 되돌아가려 하면 취소
+    if (
+      request.navigationType === "backforward" &&
+      request.isTopFrame &&
+      isKendUrl(currentUrlRef.current) &&
+      isPaymentFlowUrl(request.url ?? "")
+    ) {
+      return false;
+    }
+
+    // kend↔외부(결제창) http(s) 최상위 이동 시 흰 화면 깜빡임 덮기
+    const isHttpTopNav =
+      request.isTopFrame &&
+      request.navigationType !== "backforward" &&
+      /^https?:\/\//i.test(request.url ?? "");
+    if (isHttpTopNav) {
+      const leavingKend = !isKendUrl(request.url);
+      const returningFromPayment =
+        isKendUrl(request.url) && wasExternalRef.current;
+      if (leavingKend || returningFromPayment) {
+        if (loadingTimerRef.current) {
+          clearTimeout(loadingTimerRef.current);
+          loadingTimerRef.current = null;
+        }
+        setIsLoading(true);
+        if (overlaySafetyTimerRef.current)
+          clearTimeout(overlaySafetyTimerRef.current);
+        overlaySafetyTimerRef.current = setTimeout(() => setIsLoading(false), 8000);
+      }
+    }
+
     return true;
   };

@@ handleLoadEnd
     if (loadingTimerRef.current) {
       clearTimeout(loadingTimerRef.current);
       loadingTimerRef.current = null;
     }
+    if (overlaySafetyTimerRef.current) {
+      clearTimeout(overlaySafetyTimerRef.current);
+      overlaySafetyTimerRef.current = null;
+    }
     setIsLoading(false);
```

---

## 5. 테스트 체크리스트 (iOS + Android 각각)

**진입**
- [ ] 장바구니 결제하기 → kend 에러화면 없이 Toss 결제창까지
- [ ] 상품상세 바로구매 → 동일
- [ ] kend↔Toss 전환 시 흰 화면 대신 크림색 로딩 오버레이
- [ ] 카드사 인증 화면 정상 진입

**취소 → 복귀 (핵심)**
- [ ] 장바구니에서 시작 → 취소 → 장바구니 복귀 + 회색 "결제가 취소되었습니다"
- [ ] 상품상세에서 시작 → 취소 → 상품상세 복귀 (안내 없음)
- [ ] 복귀 후 Android 하드웨어 back → 아무 일 없음 (Toss 안 감)
- [ ] 복귀 후 iOS 스와이프 back → 안 먹음 (Toss 안 감)
- [ ] 복귀 후 다른 탭 이동 → 그 다음부터 back 정상

**실패 → 복귀**
- [ ] (가능하면) 결제 실패 유도 → 시작 지점 복귀 + 에러 표시

**성공**
- [ ] 결제 완료 → 주문내역, back 눌러도 Toss 안 감

**회귀 (안 깨졌는지)**
- [ ] 소셜 로그인(구글/네이버) 정상
- [ ] `/auth/*`, `/children/submit`에서 Android back → 기존 확인 Alert 그대로
- [ ] 일반 화면 이동/뒤로가기 정상

---

## 6. kend 웹에서 같이 나가는 변경 (참고 — kend-native가 할 일 아님)

kend repo 재배포에 포함:
- `root.tsx`, `shopping-cart-page.tsx`, `product-page.tsx` — 주문 생성 직후 loader 재조회 안 함 (증상 1)
- `product-purchase-modal.tsx` — `failUrl`에 시작 지점 정보 실어보냄 (취소 시 상품상세/장바구니 구분 복귀), 위젯 에러 처리
- `payment-fail-page.tsx` — 취소는 조용히 복귀, 실패는 에러 표시

**둘 다 나가야 완전히 검증됨.** kend 재배포 먼저 → 앱 빌드.

---

## 7. 이번 범위 아님

앱스킴(`intent://`, `supertoss://`) → `Linking.openURL` 처리 미구현.
현재 iOS 카드사 인증은 뜨므로 보류. Android + 실제 앱카드에서 문제되면 그때 별도 작업.
