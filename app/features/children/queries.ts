import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const getChildren = async (
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  const { data, error } = await client
    .from("children")
    .select("*")
    .eq("parent_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};
