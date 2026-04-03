import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

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
          content="width=device-width, initial-scale=1, viewport-fit=cover"
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
    if (!pathname.startsWith("/auth")) {
      return redirect("/auth/login", { headers });
    }
  }
  return { user: null, cartCount: 0 };
};

export default function App() {
  useAuthListener();
  const { pathname } = useLocation();
  const naviMenus = ["/stores", "/children/:childId", "/likes", "/myPage"];

  return (
    <div className="h-screen overflow-hidden">
      <Outlet />
      {(naviMenus.includes(pathname) ||
        (pathname.includes("/children")
          ? !isNaN(Number(pathname.split("/children/").at(-1)))
          : false)) && <BottomNavigation />}
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
