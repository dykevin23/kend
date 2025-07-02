import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const checkNicknameExists = async (
  client: SupabaseClient<Database>,
  { nickname }: { nickname: string }
) => {
  const { error } = await client
    .from("profiles")
    .select("profile_id")
    .eq("nickname", nickname)
    .single();

  if (error) return false;
  return true;
};
