import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "react-router";
import type { Database } from "~/supa-client";

export const getLoggedInUserId = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.auth.getUser();
  if (error || data.user === null) {
    throw redirect("/auth/login");
  }

  return data.user.id;
};

export const getProfileByUserId = async (
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  const { data, error } = await client
    .from("profiles")
    .select(
      `
      *,
      followers:stats->>followers,
      following:stats->>following
    `
    )
    .eq("profile_id", userId)
    .single();
  if (error) throw error;
  return data;
};
