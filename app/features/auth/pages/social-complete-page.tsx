import { z } from "zod";
import { redirect } from "react-router";
import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/social-complete-page";

const paramsSchema = z.object({
  provider: z.enum(["kakao", "google"]),
});

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data } = paramsSchema.safeParse(params);
  if (!success) return redirect("/auth/login");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return redirect("/auth/login");

  if (["kakao", "google"].includes(data.provider)) {
    const { client, headers } = makeSSRClient(request);
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw error;

    // Google은 외부 브라우저(WebBrowser.openAuthSessionAsync)로 열리므로
    // 세션 토큰을 딥링크로 전달하여 네이티브에서 setSession() 처리
    // 302 redirect 대신 loader에서 토큰을 반환 → 클라이언트에서 JS redirect
    if (data.provider === "google") {
      const { data: sessionData } = await client.auth.getSession();
      return {
        provider: "google",
        accessToken: sessionData.session?.access_token ?? null,
        refreshToken: sessionData.session?.refresh_token ?? null,
      };
    }

    return redirect("/", { headers });
  }
};

export default function SocialCompletePage({
  loaderData,
}: Route.ComponentProps) {
  const data = loaderData as {
    provider: string;
    accessToken: string | null;
    refreshToken: string | null;
  };

  // Google: JS로 딥링크 redirect (302 대신)
  if (data?.provider === "google" && data.accessToken && data.refreshToken) {
    const deepLink = `kend://auth/callback?access_token=${data.accessToken}&refresh_token=${data.refreshToken}`;
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = "${deepLink}";`,
        }}
      />
    );
  }

  // fallback
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-sm text-gray-500">로그인 처리 중...</p>
    </div>
  );
}
