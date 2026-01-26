import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 상품 좋아요 추가
 */
export const addProductLike = async (
  client: Client,
  userId: string,
  productId: string
) => {
  const { data, error } = await client
    .from("product_likes")
    .insert({
      user_id: userId,
      product_id: productId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 상품 좋아요 취소
 */
export const removeProductLike = async (
  client: Client,
  userId: string,
  productId: string
) => {
  const { error } = await client
    .from("product_likes")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
};

/**
 * 상품 좋아요 토글 (있으면 삭제, 없으면 추가)
 * @returns 토글 후 좋아요 상태 (true: 좋아요됨, false: 좋아요 취소됨)
 */
export const toggleProductLike = async (
  client: Client,
  userId: string,
  productId: string
): Promise<boolean> => {
  // 기존 좋아요 확인
  const { data: existing } = await client
    .from("product_likes")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    // 이미 좋아요 → 취소
    await removeProductLike(client, userId, productId);
    return false;
  } else {
    // 좋아요 추가
    await addProductLike(client, userId, productId);
    return true;
  }
};
