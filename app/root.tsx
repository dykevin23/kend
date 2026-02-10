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
import { AlertProvider } from "./hooks/useAlert";
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
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
