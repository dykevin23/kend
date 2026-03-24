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

  const response = await createNaverUser(accessToken, userData);
  const json = await response.json();

  if (!json.link) {
    return redirect("/auth/login?error=naver_create_failed");
  }

  return redirect(json.link);
};

interface NaverUserProps {
  id: string;
  nickname: string;
  profile_image: string;
  email: string;
  name: string;
}

const createNaverUser = async (token: string, user: NaverUserProps) => {
  const result = await fetch(
    `${process.env.SUPABASE_URL}/functions/v1/create-naver-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token, ...user }),
    }
  );

  return result;
};
