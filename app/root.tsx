import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
  type ShouldRevalidateFunction,
} from "react-router";
import { useEffect, useState } from "react";

import type { Route } from "./+types/root";
import "./app.css";
import { Settings } from "luxon";
import BottomNavigation from "./common/components/bottom-navigation";
import { makeSSRClient } from "./supa-client";
import { Toaster } from "sonner";
import { AlertProvider } from "./hooks/useAlert";
import { useAuthListener } from "./hooks/useAuthListener";
import { getCartCount } from "./features/carts/queries";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  Settings.defaultLocale = "ko";
  Settings.defaultZone = "Asia/Seoul";
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <main>
          <AlertProvider>{children}</AlertProvider>
        </main>
        <Toaster position="top-center" richColors duration={3000} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (user) {
    const cartCount = await getCartCount(client, user.id);
    return { user, cartCount };
  } else {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const publicPaths = ["/auth", "/terms", "/privacy", "/myPage/terms", "/myPage/privacy"];
    if (!publicPaths.some((p) => pathname.startsWith(p))) {
      return redirect("/auth/login", { headers });
    }
  }
  return { user: null, cartCount: 0 };
};

// 뒤로가기(POP) 등 단순 경로 변경에서는 root loader 재실행 방지.
// form action(로그인/로그아웃/장바구니 담기 등) 후에는 정상 revalidate.
// 같은 URL 내 쿼리 변경 등에선 기본 동작 유지.
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}) => {
  if (formMethod && formMethod !== "GET") return true;
  if (currentUrl.pathname !== nextUrl.pathname) return false;
  return defaultShouldRevalidate;
};

function GlobalLoadingBar() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const [shouldShow, setShouldShow] = useState(false);

  // 짧은 전환(뒤로가기 등)에서 progress bar가 번쩍이는 걸 막기 위한 delay.
  // 200ms 내 끝나는 로딩은 bar 표시 안 함.
  useEffect(() => {
    if (!isLoading) {
      setShouldShow(false);
      return;
    }
    const timer = setTimeout(() => setShouldShow(true), 200);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!shouldShow) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-200">
      <div className="h-full bg-secondary animate-progress" />
    </div>
  );
}

// 임시 진단: iOS WebView swipe-back 동작 확인용. 진단 후 제거.
// sessionStorage에 누적해서 풀 리로드도 견딤.
const SWIPE_DIAG_KEY = "swipeDiagLogs";

function SwipeDiagOverlay() {
  const [logs, setLogs] = useState<string[]>([]);
  const navigation = useNavigation();

  const append = (label: string, extra?: unknown) => {
    const ts = new Date().toISOString().slice(11, 23);
    const entry = `${ts} ${label} ${extra !== undefined ? JSON.stringify(extra) : ""}`;
    try {
      const raw = sessionStorage.getItem(SWIPE_DIAG_KEY);
      const current = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [...current, entry].slice(-20);
      sessionStorage.setItem(SWIPE_DIAG_KEY, JSON.stringify(next));
      setLogs(next);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SWIPE_DIAG_KEY);
      setLogs(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      // ignore
    }

    const onPageShow = (e: PageTransitionEvent) =>
      append("pageshow", { persisted: e.persisted, url: location.pathname });
    const onPageHide = (e: PageTransitionEvent) =>
      append("pagehide", { persisted: e.persisted, url: location.pathname });
    const onPopState = () =>
      append("popstate", { url: location.pathname });
    const onBeforeUnload = () =>
      append("beforeunload", { url: location.pathname });

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);
    append("mount", { url: location.pathname });

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // navigation.state 변화를 추적: idle → loading → idle 이면 loader 재실행됨
  useEffect(() => {
    append(`nav:${navigation.state}`, {
      to: navigation.location?.pathname,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.state, navigation.location?.pathname]);

  const handleClear = () => {
    sessionStorage.removeItem(SWIPE_DIAG_KEY);
    setLogs([]);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 4,
        right: 4,
        zIndex: 99999,
        maxWidth: "70vw",
        maxHeight: "40vh",
        overflowY: "auto",
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontSize: 9,
        fontFamily: "monospace",
        padding: 4,
        borderRadius: 4,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={handleClear}
        style={{
          background: "#900",
          color: "#fff",
          fontSize: 9,
          border: "none",
          padding: "2px 6px",
          marginBottom: 2,
          borderRadius: 2,
        }}
      >
        clear
      </button>
      {logs.map((l, i) => (
        <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {l}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  useAuthListener();
  const { pathname } = useLocation();
  const showBottomNav =
    pathname === "/stores" ||
    pathname === "/children" ||
    /^\/children\/\d+$/.test(pathname) ||
    pathname === "/likes" ||
    pathname === "/myPage";

  return (
    <div className="h-screen overflow-hidden">
      <GlobalLoadingBar />
      <Outlet />
      {showBottomNav && <BottomNavigation />}
      <SwipeDiagOverlay />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "문제가 발생했어요";
  let details = "일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
  let stack: string | undefined;
  let is404 = false;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      is404 = true;
      title = "페이지를 찾을 수 없어요";
      details = "요청하신 페이지가 존재하지 않아요.";
    } else {
      title = `오류가 발생했어요 (${error.status})`;
      details = error.statusText || details;
    }
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <p className="text-6xl mb-4">{is404 ? "404" : "!"}</p>
      <h1 className="text-xl font-semibold mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-8">{details}</p>
      <div className="flex gap-3">
        <a
          href="/"
          className="px-6 py-2.5 rounded-full border border-gray-300 text-sm"
        >
          홈으로
        </a>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full bg-secondary text-secondary-foreground text-sm"
        >
          다시 시도
        </button>
      </div>
      {stack && (
        <pre className="mt-8 w-full max-w-lg p-4 overflow-x-auto text-left text-xs bg-gray-100 rounded-lg">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
