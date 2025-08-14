import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const createChild = async (
  client: SupabaseClient<Database>,
  {
    gender,
    birthday,
    nickname,
    name,
    parent_id,
  }: {
    gender: "male" | "female";
    birthday: string;
    nickname: string;
    name: string;
    parent_id: string;
  }
) => {
  const { data, error } = await client
    .from("children")
    .insert({
      gender,
      birthday,
      nickname,
      name,
      parent_id,
    })
    .select("child_id")
    .single();

  if (error) throw error;
  return { data };
};
