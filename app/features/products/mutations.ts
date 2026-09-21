import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 상품 조회 기록 (최근 본 상품) — 조회할 때마다 남기는 로그가 아니라
 * user_id+product_id당 마지막 조회 시점만 upsert로 갱신
 */
export const recordProductView = async (
  client: Client,
  userId: string,
  productId: string
) => {
  const { error } = await client.from("product_views").upsert(
    {
      user_id: userId,
      product_id: productId,
      viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_id" }
  );

  if (error) throw error;
};
