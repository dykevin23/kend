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
  { images, productId }: { images: string[]; productId: number }
) => {
  const rows = images.map((img) => ({ image: img, product_id: productId }));
  const { error } = await client.from("product_images").insert(rows);
  if (error) throw error;
};

export const createProductHashTags = async (
  client: SupabaseClient<Database>,
  { productId, hashTags }: { productId: number; hashTags: string[] }
) => {
  const rows = hashTags.map((tag) => ({ hashtag: tag, product_id: productId }));
  const { error } = await client.from("product_hashtags").insert(rows);
  if (error) throw error;
};

export const likeProduct = async (
  client: SupabaseClient<Database>,
  { userId, productId }: { userId: string; productId: string }
) => {
  const { count } = await client
    .from("product_likes")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", userId)
    .eq("product_id", Number(productId));

  if (count === 0) {
    await client.from("product_likes").insert({
      product_id: Number(productId),
      profile_id: userId,
    });
  } else {
    await client
      .from("product_likes")
      .delete()
      .eq("profile_id", userId)
      .eq("product_id", Number(productId));
  }
};
