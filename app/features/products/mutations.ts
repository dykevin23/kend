import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const createProduct = async (
  client: SupabaseClient<Database>,
  {
    title,
    price,
    description,
    location,
    userId,
  }: {
    title: string;
    price: number;
    description: string;
    location: string;
    userId: string;
  }
) => {
  const { data, error } = await client
    .from("products")
    .insert({
      name: title,
      price,
      description,
      deal_location: location,
      status: "sales",
      profile_id: userId,
    })
    .select("product_id")
    .single();

  if (error) throw error;
  return { data };
};

export const createProductImages = async (
  client: SupabaseClient<Database>,
  { image, productId }: { image: string; productId: number }
) => {
  const { error } = await client
    .from("product_images")
    .insert({ image, product_id: productId });
  if (error) throw error;
};
