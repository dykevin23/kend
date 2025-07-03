import { z } from "zod";
import { redirect } from "react-router";
import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/social-complete-page";

const paramsSchema = z.object({
  provider: z.enum(["naver", "kakao", "google"]),
});

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data } = paramsSchema.safeParse(params);
  if (!success) return redirect("/auth/login");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return redirect("/auth/login");
  const { client, headers } = makeSSRClient(request);
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) throw error;
  return redirect("/", { headers });
};
