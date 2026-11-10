import { redirect } from "react-router";
import type { Route } from "./+types/naver-complete-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const tokenRes = await fetch(
    `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${
      process.env.NAVER_CLIENT_ID
    }&client_secret=${
      process.env.NAVER_CLIENT_SECRET
    }&code=${code}&state=${state}`
  );
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return redirect("/auth/login?error=naver_token_failed");
  }

  // Naver 사용자 정보 요청
  const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profileData = await profileRes.json();
  const userData = profileData.response;

  if (!userData) {
    return redirect("/auth/login?error=naver_profile_failed");
  }

  const response = await createNaverUser(accessToken);
  const json = await response.json();

  if (!json.link) {
    return redirect("/auth/login?error=naver_create_failed");
  }

  return redirect(json.link);
};

// 프로필은 함수가 토큰으로 직접 조회·검증하므로 토큰만 넘긴다.
// 로그인 링크가 돌아올 주소(redirectTo)는 지금 실행 중인 서버 기준으로 넘긴다 —
// 같은 Supabase를 쓰는 로컬·개발 서버가 각자 자기 주소로 돌아오게 하기 위함
// (예전엔 함수 시크릿 SITE_URL 하나뿐이라 로컬/앱 중 한쪽 로그인이 다른 주소로 튕겼음)
// 서버 전용 loader라 secret 키를 apikey 헤더로 보낸다 (새 API 키는 Bearer가 아니라 apikey 헤더)
const createNaverUser = async (token: string) => {
  const result = await fetch(
    `${process.env.SUPABASE_URL}/functions/v1/create-naver-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SECRET_KEY!,
      },
      body: JSON.stringify({
        token,
        redirectTo: `${process.env.REDIRECT_LOGIN_URL}/auth/naver/callback`,
      }),
    }
  );

  return result;
};
