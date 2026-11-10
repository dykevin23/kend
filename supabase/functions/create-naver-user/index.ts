// 네이버 로그인 — kend 서버(/auth/naver/complete)만 호출한다.
// 네이버는 Supabase 기본 provider가 아니라서, 네이버 토큰을 검증한 뒤 회원을 만들고
// magic link를 발급해 세션을 맺는다.
//
// 보안 규칙
// - 호출자: apikey 헤더가 이 프로젝트의 secret 키여야 한다 (verify_jwt=false — supabase/config.toml)
// - 신원: 요청 body의 프로필은 믿지 않는다. 네이버 토큰으로 프로필을 직접 조회해 그 id·이메일만 쓴다
//   (예전에는 body의 email을 그대로 써서, 함수만 호출하면 남의 계정 로그인 링크를 받을 수 있었음)
import { createClient } from "npm:@supabase/supabase-js@2";

interface NaverProfile {
  id: string;
  email?: string;
  name?: string;
  nickname?: string;
  profile_image?: string;
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// SUPABASE_SECRET_KEYS: 런타임이 주입하는 { 키이름: 키값 } JSON
const getSecretKeys = (): string[] => {
  try {
    return Object.values(
      JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"),
    ) as string[];
  } catch {
    return [];
  }
};

const fetchNaverProfile = async (
  token: string,
): Promise<NaverProfile | null> => {
  const res = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.resultcode === "00" && data.response?.id ? data.response : null;
};

Deno.serve(async (req) => {
  const apiKey = req.headers.get("apikey");
  if (!apiKey || !getSecretKeys().includes(apiKey)) {
    return json({ error: "unauthorized" }, 401);
  }

  try {
    const { token, redirectTo } = await req.json();
    if (typeof token !== "string" || !token) {
      return json({ error: "token required" }, 400);
    }

    // 로그인 링크가 돌아올 주소 — 호출한 kend 서버가 자기 주소를 넘긴다 (로컬·개발 서버·운영 각자).
    // 없거나 형식이 이상하면 SITE_URL 기본값. 최종 허용 여부는 Supabase Auth의 Redirect URLs 목록이 판단
    // (목록에 없으면 Supabase가 Site URL로 보낸다)
    const callbackUrl =
      typeof redirectTo === "string" && /^https?:\/\/[^/]+\/auth\/naver\/callback$/.test(redirectTo)
        ? redirectTo
        : `${Deno.env.get("SITE_URL")}/auth/naver/callback`;

    const profile = await fetchNaverProfile(token);
    if (!profile) {
      return json({ error: "invalid naver token" }, 401);
    }

    // 이메일 제공에 동의하지 않은 계정은 네이버 id 기반 주소로 만든다 — 생성·링크 발급 모두 같은 값
    const email = profile.email ?? `${profile.id}@naver-user.local`;

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, apiKey);

    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        id: profile.id,
        name: profile.name,
        nickname: profile.nickname,
        profile_image: profile.profile_image,
        email: profile.email,
        provider: "naver",
      },
    });

    // 이미 가입된 유저면 createError 발생 → 무시하고 link 발급으로 진행
    if (createError) {
      console.log(
        "User already exists, proceeding to generate link:",
        createError.message,
      );
    }

    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: callbackUrl },
      });

    if (linkError) throw linkError;

    return json({ link: linkData.properties.action_link }, 200);
  } catch (error) {
    console.error("Error in create-naver-user:", error);
    return json({ error: (error as Error).message }, 400);
  }
});
