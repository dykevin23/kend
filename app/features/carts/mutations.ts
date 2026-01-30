import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 장바구니에 상품 추가 (upsert)
 * - 이미 같은 SKU가 있으면 수량 증가
 * - 없으면 새로 추가
 */
export const addToCart = async (
  client: Client,
  userId: string,
  skuId: string,
  quantity: number = 1,
) => {
  // 기존 장바구니 항목 확인
  const { data: existing } = await client
    .from("carts")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("sku_id", skuId)
    .single();

  if (existing) {
    // 이미 있으면 수량 증가
    const { data, error } = await client
      .from("carts")
      .update({
        quantity: existing.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 없으면 새로 추가
  const { data, error } = await client
    .from("carts")
    .insert({
      user_id: userId,
      sku_id: skuId,
      quantity,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 장바구니 수량 변경
 */
export const updateCartQuantity = async (
  client: Client,
  cartId: string,
  quantity: number,
) => {
  const { data, error } = await client
    .from("carts")
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 장바구니 상품 삭제
 */
export const removeFromCart = async (client: Client, cartId: string) => {
  const { error } = await client.from("carts").delete().eq("id", cartId);

  if (error) throw error;
};

/**
 * 여러 장바구니 상품 삭제
 */
export const removeMultipleFromCart = async (
  client: Client,
  cartIds: string[],
) => {
  const { error } = await client.from("carts").delete().in("id", cartIds);

  if (error) throw error;
};

/**
 * 사용자의 장바구니 전체 비우기
 */
export const clearCart = async (client: Client, userId: string) => {
  const { error } = await client.from("carts").delete().eq("user_id", userId);

  if (error) throw error;
};
