import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import type { InquiryCategory } from "./types";

type Client = SupabaseClient<Database>;

/**
 * 문의 작성
 *
 * order_item_id가 있으면 본인 소유 상품(주문)인지 확인한다 — order_group이 아니라
 * order_item에 연결하는 이유는 order_group은 여러 판매자 주문을 포함할 수 있어
 * "어느 판매자 몫인지" 특정이 안 되지만 order_item은 판매자가 항상 유일하게
 * 정해지기 때문(schema.ts 주석 참고). 답변(answer)은 kend-seller 처리화면에서
 * 채워진다 — 여기선 항상 status='pending'으로 생성.
 */
export const createInquiry = async (
  client: Client,
  {
    userId,
    category,
    title,
    content,
    orderItemId,
  }: {
    userId: string;
    category: InquiryCategory;
    title: string;
    content: string;
    orderItemId: string | null;
  }
) => {
  if (orderItemId) {
    const { data: orderItem, error: orderItemError } = await client
      .from("order_items")
      .select("id, orders!inner ( order_groups!inner ( user_id ) )")
      .eq("id", orderItemId)
      .eq("orders.order_groups.user_id", userId)
      .maybeSingle();

    if (orderItemError || !orderItem) {
      throw new Error("본인 주문의 상품만 연결할 수 있습니다.");
    }
  }

  const { data, error } = await client
    .from("inquiries")
    .insert({
      user_id: userId,
      order_item_id: orderItemId,
      category,
      title,
      content,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw error ?? new Error("문의 등록에 실패했습니다.");
  }

  return { inquiryId: data.id };
};
