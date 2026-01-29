import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 주문 내역 탭 필터 타입
 */
export type OrderTabFilter =
  | "all"
  | "payment_pending"
  | "in_delivery"
  | "delivered"
  | "cancelled";

/**
 * 사용자 주문 그룹 목록 조회
 * order_groups와 연관된 orders, order_items를 함께 조회
 */
export const getUserOrderGroups = async (
  client: Client,
  userId: string,
  filter: OrderTabFilter = "all"
) => {
  // 기본 쿼리: payment_in_progress와 failed는 제외
  let query = client
    .from("order_groups")
    .select(
      `
      id,
      order_number,
      status,
      total_amount,
      created_at,
      orders (
        id,
        seller_name,
        status,
        order_items (
          id,
          product_name,
          options,
          main_image,
          sale_price,
          quantity,
          subtotal
        )
      )
    `
    )
    .eq("user_id", userId)
    .not("status", "in", '("payment_in_progress","failed")');

  // 탭 필터 적용
  switch (filter) {
    case "payment_pending":
      query = query.eq("status", "payment_pending");
      break;
    case "in_delivery":
      // 결제 완료 상태에서 배송중인 주문
      query = query.eq("status", "paid");
      break;
    case "delivered":
      // 결제 완료 상태에서 배송 완료된 주문
      query = query.eq("status", "paid");
      break;
    case "cancelled":
      query = query.in("status", [
        "cancelled",
        "refunded",
        "partially_refunded",
      ]);
      break;
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;

  // 배송중/배송완료 필터링 (orders.status 기준으로 클라이언트 사이드 필터)
  let filteredData = data;
  if (filter === "in_delivery") {
    filteredData = data.filter((group) =>
      group.orders.some((order) =>
        ["pending", "confirmed", "preparing", "shipped"].includes(order.status)
      )
    );
  } else if (filter === "delivered") {
    filteredData = data.filter((group) =>
      group.orders.every((order) => order.status === "delivered")
    );
  }

  return filteredData.map((group) => ({
    id: group.id,
    orderNumber: group.order_number,
    status: group.status,
    totalAmount: group.total_amount,
    createdAt: group.created_at,
    orders: group.orders.map((order) => ({
      id: order.id,
      sellerName: order.seller_name,
      status: order.status,
      items: order.order_items.map((item) => ({
        id: item.id,
        productName: item.product_name,
        options: item.options as Record<string, string> | null,
        mainImage: item.main_image,
        salePrice: item.sale_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    })),
  }));
};

export type UserOrderGroup = Awaited<
  ReturnType<typeof getUserOrderGroups>
>[number];
export type UserOrder = UserOrderGroup["orders"][number];
export type UserOrderItem = UserOrder["items"][number];

/**
 * 주문 그룹 상세 조회
 */
export const getOrderGroupDetail = async (
  client: Client,
  orderGroupId: string,
  userId: string
) => {
  const { data, error } = await client
    .from("order_groups")
    .select(
      `
      id,
      order_number,
      status,
      total_product_amount,
      total_shipping_fee,
      total_discount_amount,
      total_amount,
      recipient_name,
      recipient_phone,
      zone_code,
      address,
      address_detail,
      payment_method,
      paid_at,
      created_at,
      orders (
        id,
        order_number,
        seller_name,
        seller_code,
        status,
        product_amount,
        shipping_fee,
        total_amount,
        order_items (
          id,
          product_id,
          product_name,
          product_code,
          sku_code,
          options,
          main_image,
          regular_price,
          sale_price,
          quantity,
          subtotal,
          shipping_fee_type,
          base_shipping_fee
        )
      )
    `
    )
    .eq("id", orderGroupId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    orderNumber: data.order_number,
    status: data.status,
    totalProductAmount: data.total_product_amount,
    totalShippingFee: data.total_shipping_fee,
    totalDiscountAmount: data.total_discount_amount,
    totalAmount: data.total_amount,
    recipientName: data.recipient_name,
    recipientPhone: data.recipient_phone,
    zoneCode: data.zone_code,
    address: data.address,
    addressDetail: data.address_detail,
    paymentMethod: data.payment_method,
    paidAt: data.paid_at,
    createdAt: data.created_at,
    orders: data.orders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      sellerName: order.seller_name,
      sellerCode: order.seller_code,
      status: order.status,
      productAmount: order.product_amount,
      shippingFee: order.shipping_fee,
      totalAmount: order.total_amount,
      items: order.order_items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        productCode: item.product_code,
        skuCode: item.sku_code,
        options: item.options as Record<string, string> | null,
        mainImage: item.main_image,
        regularPrice: item.regular_price,
        salePrice: item.sale_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        shippingFeeType: item.shipping_fee_type,
        baseShippingFee: item.base_shipping_fee,
      })),
    })),
  };
};

export type OrderGroupDetail = Awaited<ReturnType<typeof getOrderGroupDetail>>;

/**
 * 사용자 주문 개수 조회
 * payment_in_progress, failed 상태 제외
 */
export const getUserOrderCount = async (client: Client, userId: string) => {
  const { count, error } = await client
    .from("order_groups")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("status", "in", '("payment_in_progress","failed")');

  if (error) throw error;

  return count ?? 0;
};
