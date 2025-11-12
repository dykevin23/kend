import { redirect } from "react-router";

export const loader = async () => {
  const redirectTo = `${process.env.REDIRECT_LOGIN_URL}/auth/naver/complete`;
  const state = crypto.randomUUID(); // CSRF 방지용
  const naverAuthUrl = new URL("https://nid.naver.com/oauth2.0/authorize");
  naverAuthUrl.searchParams.set("response_type", "code");
  naverAuthUrl.searchParams.set("client_id", process.env.NAVER_CLIENT_ID!);
  naverAuthUrl.searchParams.set("redirect_uri", redirectTo);
  naverAuthUrl.searchParams.set("state", state);

  return redirect(naverAuthUrl.toString());
};
