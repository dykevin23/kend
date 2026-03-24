import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("PROJECT_URL"),
      Deno.env.get("SERVICE_ROLE_KEY")
    );

    const { id, nickname, profile_image, email, name } = await req.json();

    // 먼저 유저 생성 시도
    const { error: createError } =
      await supabase.auth.admin.createUser({
        email: email ?? `${id}@naver-user.local`,
        email_confirm: true,
        user_metadata: {
          id,
          name,
          nickname,
          profile_image,
          email,
          provider: "naver",
        },
      });

    // 이미 존재하는 유저면 createError 발생 → 무시하고 link 발급으로 진행
    if (createError) {
      console.log("User already exists, proceeding to generate link:", createError.message);
    }

    // 세션 토큰 발급 (Magic Link)
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: email,
        options: {
          redirectTo: "http://localhost:5173/auth/naver/callback",
        },
      });

    if (linkError) throw linkError;

    return new Response(
      JSON.stringify({
        link: linkData.properties.action_link,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-naver-user:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
});
