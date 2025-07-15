import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import { PAGE_SIZE } from "./constrants";

export const getProducts = async (
  client: SupabaseClient<Database>,
  { page = 1 }: { page: number }
) => {
  const { data, error } = await client
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) throw error;
  return data;
};
