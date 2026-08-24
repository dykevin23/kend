import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 사용자 문의 목록 조회 (최신순)
 */
export const getUserInquiries = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("inquiries")
    .select("id, category, title, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((inquiry) => ({
    id: inquiry.id,
    category: inquiry.category,
    title: inquiry.title,
    status: inquiry.status,
    createdAt: inquiry.created_at,
  }));
};

export type UserInquiry = Awaited<ReturnType<typeof getUserInquiries>>[number];

/**
 * 문의 상세 조회 — 본인 문의만 조회 가능
 */
export const getInquiryDetail = async (
  client: Client,
  inquiryId: string,
  userId: string
) => {
  const { data, error } = await client
    .from("inquiries")
    .select(
      `
      id,
      category,
      title,
      content,
      status,
      answer,
      answered_at,
      created_at,
      order_item_id,
      order_items (
        product_name,
        main_image,
        options,
        sale_price,
        quantity,
        orders (
          seller_name,
          order_groups ( id, order_number, created_at, paid_at )
        )
      )
    `
    )
    .eq("id", inquiryId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("문의를 찾을 수 없습니다.");
  }

  const item = data.order_items;
  const order = item?.orders ?? null;
  const orderGroup = order?.order_groups ?? null;

  return {
    id: data.id,
    category: data.category,
    title: data.title,
    content: data.content,
    status: data.status,
    answer: data.answer,
    answeredAt: data.answered_at,
    createdAt: data.created_at,
    order:
      item && order && orderGroup
        ? {
            orderGroupId: orderGroup.id,
            orderNumber: orderGroup.order_number,
            createdAt: orderGroup.created_at,
            paidAt: orderGroup.paid_at,
            item: {
              sellerName: order.seller_name,
              productName: item.product_name,
              mainImage: item.main_image,
              options: item.options as Record<string, string> | null,
              salePrice: item.sale_price,
              quantity: item.quantity,
            },
          }
        : null,
  };
};

export type InquiryDetail = Awaited<ReturnType<typeof getInquiryDetail>>;

/**
 * 문의 작성 폼의 주문/상품 선택 드롭다운용 — 주문(1단계) 선택 시 그 주문에 속한
 * 상품(2단계)을 추가 요청 없이 바로 보여줄 수 있게 상품 목록까지 함께 내려준다.
 */
export const getUserOrderGroupsForPicker = async (
  client: Client,
  userId: string
) => {
  const { data, error } = await client
    .from("order_groups")
    .select(
      `
      id,
      order_number,
      created_at,
      orders (
        seller_name,
        order_items ( id, product_name, main_image, sale_price, quantity )
      )
    `
    )
    .eq("user_id", userId)
    .not("status", "in", '("payment_in_progress","failed")')
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return data.map((group) => ({
    id: group.id,
    orderNumber: group.order_number,
    createdAt: group.created_at,
    items: group.orders.flatMap((order) =>
      order.order_items.map((item) => ({
        id: item.id,
        sellerName: order.seller_name,
        productName: item.product_name,
        mainImage: item.main_image,
        salePrice: item.sale_price,
        quantity: item.quantity,
      }))
    ),
  }));
};
