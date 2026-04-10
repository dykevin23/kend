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
    if (data.provider === "google") {
      const { data: sessionData } = await client.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const refreshToken = sessionData.session?.refresh_token;

      if (accessToken && refreshToken) {
        return redirect(
          `kend://auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`
        );
      }
      // 세션 취득 실패 시 fallback
      return redirect("kend://auth/callback?success=true");
    }

    return redirect("/", { headers });
  }
};
