import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import { PAGE_SIZE } from "./constrants";

export const getProducts = async (
  client: SupabaseClient<Database>,
  { page = 1, userId }: { page: number; userId: string }
) => {
  const { data, error } = await client
    .from("products_view")
    .select("*")
    .neq("profile_id", userId)
    .order("updated_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    .limit(PAGE_SIZE);
  if (error) throw error;
  return data;
};

export const getProductsPages = async (
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  const { count, error } = await client
    .from("products_view")
    .select(`product_id`, { count: "exact", head: false })
    .neq("profile_id", userId);

  if (error) throw error;
  if (!count) return 1;
  return Math.ceil(count / PAGE_SIZE);
};

export const getProductById = async (
  client: SupabaseClient<Database>,
  { product_id }: { product_id: number }
) => {
  const { data, error } = await client
    .from("products_view")
    .select("*")
    .eq("product_id", product_id)
    .single();
  if (error) throw error;
  return data;
};

export const getImagesByProductId = async (
  client: SupabaseClient<Database>,
  { product_id }: { product_id: number }
) => {
  const { data, error } = await client
    .from("product_images")
    .select("image")
    .eq("product_id", product_id);
  if (error) throw error;
  return data;
};
