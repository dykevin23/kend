import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import type { OrderItem, SellerOrderGroup } from "./types";
import type { UserAddress } from "~/features/users/queries";

type Client = SupabaseClient<Database>;

/**
 * 주문번호 생성
 * 형식: ORD-YYYYMMDD-XXXXX (예: ORD-20250129-A3F8K)
 */
function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${date}-${random}`;
}

type PaymentMethodType =
  | "bank_transfer"
  | "credit_card"
  | "mobile_payment"
  | "easy_pay"
  | "virtual_account";

interface CreateOrderParams {
  userId: string;
  address: UserAddress;
  sellerGroups: SellerOrderGroup[];
  items: OrderItem[];
  paymentMethod: string;
  deliveryMessage: string | null;
}

/**
 * 주문 생성
 * 1. order_group 생성 (결제 단위)
 * 2. 판매자별 orders 생성
 * 3. 각 order에 order_items 생성
 * 4. 각 order에 초기 delivery + delivery_items 생성
 */
export const createOrder = async (
  client: Client,
  { userId, address, sellerGroups, paymentMethod, deliveryMessage }: CreateOrderParams
) => {
  const groupOrderNumber = generateOrderNumber();

  // 전체 금액 계산
  const totalProductAmount = sellerGroups.reduce(
    (sum, g) => sum + g.subtotal,
    0
  );
  const totalShippingFee = sellerGroups.reduce(
    (sum, g) => sum + g.shippingFee,
    0
  );
  const totalAmount = totalProductAmount + totalShippingFee;

  // 결제 수단에 따른 초기 상태 결정
  // - bank_transfer: 무통장입금 → 결제대기 (payment_pending)
  // - 그 외: PG 결제 → 결제 진행중 (payment_in_progress)
  const initialStatus: "payment_pending" | "payment_in_progress" =
    paymentMethod === "bank_transfer" ? "payment_pending" : "payment_in_progress";

  // 1. order_group 생성
  const { data: orderGroup, error: groupError } = await client
    .from("order_groups")
    .insert({
      user_id: userId,
      order_number: groupOrderNumber,
      status: initialStatus,
      total_product_amount: totalProductAmount,
      total_shipping_fee: totalShippingFee,
      total_discount_amount: 0,
      total_amount: totalAmount,
      recipient_name: address.recipientName,
      recipient_phone: address.recipientPhone,
      zone_code: address.zoneCode,
      address: address.address,
      address_detail: address.addressDetail ?? null,
      delivery_message: deliveryMessage,
      payment_method: paymentMethod as PaymentMethodType,
    })
    .select("id")
    .single();

  if (groupError) throw groupError;

  // 2. 판매자별 order + order_items + delivery 생성
  for (let i = 0; i < sellerGroups.length; i++) {
    const group = sellerGroups[i];
    const orderNumber = `${groupOrderNumber}-${String(i + 1).padStart(2, "0")}`;

    const orderTotalAmount = group.subtotal + group.shippingFee;

    // order 생성
    const { data: order, error: orderError } = await client
      .from("orders")
      .insert({
        order_group_id: orderGroup.id,
        seller_id: group.seller?.id ?? "",
        order_number: orderNumber,
        status: "pending",
        product_amount: group.subtotal,
        shipping_fee: group.shippingFee,
        total_amount: orderTotalAmount,
        seller_name: group.seller?.name ?? "",
        seller_code: group.seller?.sellerCode ?? "",
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    // order_items 생성
    const orderItemsData = group.items.map((item) => ({
      order_id: order.id,
      sku_id: item.skuId,
      product_id: item.product.id,
      product_name: item.product.name,
      product_code: item.product.productCode,
      sku_code: item.sku.skuCode,
      options: item.sku.options,
      main_image: item.product.mainImage,
      regular_price: item.sku.regularPrice,
      sale_price: item.sku.salePrice,
      quantity: item.quantity,
      subtotal: item.sku.salePrice * item.quantity,
      shipping_fee_type: item.delivery?.shippingFeeType ?? ("FREE" as const),
      base_shipping_fee: item.delivery?.shippingFee ?? 0,
      free_shipping_condition_value: item.delivery?.freeShippingCondition ?? null,
      ship_from_region: null,
    }));

    const { data: insertedItems, error: itemsError } = await client
      .from("order_items")
      .insert(orderItemsData)
      .select("id, quantity");

    if (itemsError) throw itemsError;

    // delivery 생성 (초기 상태)
    const { data: delivery, error: deliveryError } = await client
      .from("deliveries")
      .insert({
        order_id: order.id,
        status: "pending",
        shipping_fee: group.shippingFee,
      })
      .select("id")
      .single();

    if (deliveryError) throw deliveryError;

    // delivery_items 생성
    const deliveryItemsData = insertedItems.map((orderItem) => ({
      delivery_id: delivery.id,
      order_item_id: orderItem.id,
      quantity: orderItem.quantity,
      status: "normal" as const,
    }));

    const { error: deliveryItemsError } = await client
      .from("delivery_items")
      .insert(deliveryItemsData);

    if (deliveryItemsError) throw deliveryItemsError;
  }

  return { orderGroupId: orderGroup.id, orderNumber: groupOrderNumber };
};
