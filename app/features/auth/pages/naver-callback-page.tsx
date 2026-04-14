import type { Route } from "./+types/naver-callback-page";
import { redirect } from "react-router";
import { useEffect } from "react";
import { makeSSRClient } from "~/supa-client";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get("access_token");
  const refreshToken = url.searchParams.get("refresh_token");

  if (accessToken && refreshToken) {
    const { client, headers } = makeSSRClient(request);
    const { error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("Session set error:", error);
    }

    // 세션 설정 후 홈으로 redirect
    return redirect("/", { headers });
  }
};

export default function NaverCallbackPage() {
  useEffect(() => {
    if (window.location.hash.startsWith("#access_token")) {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const query = params.toString();
      window.location.replace(`/auth/naver/callback?${query}`);
    }
  }, []);
  return <></>;
}
