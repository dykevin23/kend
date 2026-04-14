import { redirect } from "react-router";
import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/home-page";

/**
 * 홈 → /stores redirect
 *
 * [임시 처리] Supabase PKCE flow가 Site URL(/)로 ?code=xxx를 보내는 경우,
 * 여기서 세션 교환을 처리한다.
 * Supabase는 프로젝트당 Site URL이 하나라서, 프로덕션(vercel.app)으로 설정하면
 * redirectTo 파라미터가 무시되고 Site URL 기준으로 콜백이 온다.
 * → Supabase 프로젝트 dev/prod 분리 시 제거 예정
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const { client, headers } = makeSSRClient(request);
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirect("/stores", { headers });
    }
  }

  return redirect("/stores");
};
