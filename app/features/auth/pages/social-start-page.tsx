import { z } from "zod";
import { redirect } from "react-router";
import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/social-start-page";

const paramsSchema = z.object({
  provider: z.enum(["naver", "kakao", "google"]),
});

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data } = paramsSchema.safeParse(params);

  if (!success) return redirect("/auth/login");

  const { provider } = data;
  const redirectTo = `http://localhost:5173/auth/social/${provider}/complete`;
  const { client, headers } = makeSSRClient(request);

  if (provider === "google" || provider === "kakao") {
    const {
      data: { url },
      error,
    } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (url) {
      return redirect(url, { headers });
    }

    if (error) throw error;
  } else {
  }
};
