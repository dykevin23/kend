import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import type { OrderItem, ReturnReasonType, SellerOrderGroup } from "./types";
import type { UserAddress } from "~/features/users/queries";

/** 반품 사유별 신청 기한(일). 기산점은 배송완료일. 법정 최소 기간을 코드 상수로 고정한다. */
const RETURN_WINDOW_DAYS: Record<ReturnReasonType, number> = {
  CHANGE_OF_MIND: 7,
  DEFECT: 30,
  WRONG_ITEM: 30,
  DAMAGED: 30,
  LOST: 30,
};

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

interface CreateOrderParams {
  userId: string;
  address: UserAddress;
  sellerGroups: SellerOrderGroup[];
  items: OrderItem[];
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
  { userId, address, sellerGroups, deliveryMessage }: CreateOrderParams
) => {
  const groupOrderNumber = generateOrderNumber();

  // 전체 상품금액 (플랫폼 조건부 무료배송 판정 기준, Phase 2.5-5)
  const totalProductAmount = sellerGroups.reduce(
    (sum, g) => sum + g.subtotal,
    0
  );

  // 플랫폼 조건부 무료배송: 판매자별 조건과 별개로, 장바구니 총액이 플랫폼
  // 임계값 이상이면 배송비를 플랫폼이 부담(면제)한다. row가 없거나 임계값이
  // 0이면 기능 off로 취급.
  const { data: platformSettings } = await client
    .from("platform_settings")
    .select("free_shipping_threshold")
    .limit(1)
    .maybeSingle();
  const platformThreshold = platformSettings?.free_shipping_threshold ?? 0;
  const platformFreeShipping =
    platformThreshold > 0 && totalProductAmount >= platformThreshold;

  const totalShippingFee = sellerGroups.reduce(
    (sum, g) => sum + (platformFreeShipping ? 0 : g.shippingFee),
    0
  );
  const totalAmount = totalProductAmount + totalShippingFee;

  // TossPayments 위젯 사용 → 항상 payment_in_progress로 시작
  // 결제 확인 후 payment-success-page에서 paid로 업데이트
  const initialStatus = "payment_in_progress" as const;

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
      payment_method: null, // 결제 확인 후 실제 결제수단으로 업데이트
    })
    .select("id")
    .single();

  if (groupError) throw groupError;

  // 2. 판매자별 order + order_items + delivery 생성
  for (let i = 0; i < sellerGroups.length; i++) {
    const group = sellerGroups[i];
    const orderNumber = `${groupOrderNumber}-${String(i + 1).padStart(2, "0")}`;

    // 이 판매자 몫에 플랫폼 무료배송이 실제로 적용됐는지(=판매자 자체 조건은
    // 미충족이라 원래는 유료였는데 플랫폼이 대신 면제한 경우)
    const feeWaivedByPlatform = platformFreeShipping && group.shippingFee > 0;
    const effectiveShippingFee = platformFreeShipping ? 0 : group.shippingFee;
    const shippingFeeBearer = feeWaivedByPlatform ? ("PLATFORM" as const) : ("SELLER" as const);

    const orderTotalAmount = group.subtotal + effectiveShippingFee;

    // order 생성
    const { data: order, error: orderError } = await client
      .from("orders")
      .insert({
        order_group_id: orderGroup.id,
        seller_id: group.seller?.id ?? "",
        order_number: orderNumber,
        status: "pending",
        product_amount: group.subtotal,
        shipping_fee: effectiveShippingFee,
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
      shipping_fee_bearer: shippingFeeBearer,
      ship_from_region: null,
    }));

    const { data: insertedItems, error: itemsError } = await client
      .from("order_items")
      .insert(orderItemsData)
      .select("id, quantity");

    if (itemsError) throw itemsError;

    // 재고 차감 (B안: 주문 생성 시점 즉시 차감, 실패/취소 시 트리거가 복원)
    for (const item of group.items) {
      const { error: stockError } = await client.rpc("decrement_stock", {
        p_sku_id: item.skuId,
        p_quantity: item.quantity,
      });

      if (stockError) throw stockError;
    }

    // delivery 생성 (초기 상태)
    const { data: delivery, error: deliveryError } = await client
      .from("deliveries")
      .insert({
        order_id: order.id,
        status: "pending",
        shipping_fee: effectiveShippingFee,
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

/**
 * 구매확정 (수동, delivery_item 단위)
 *
 * 배송완료(delivered)된 주문의 정상(normal) 상품만 확정 가능 — 반품/교환
 * 진행중이거나 이미 끝난 상품은 대상이 아니다. 확정 이후에는 그 상품에 한해
 * 반품/교환 신청 채널이 닫히고 "문의하기"(AS)로만 접수된다 (Phase 2.5).
 * 확정 시각은 Phase 3.5 정산 대상 판정 기준이 된다.
 */
export const confirmPurchase = async (
  client: Client,
  { userId, deliveryItemId }: { userId: string; deliveryItemId: string }
) => {
  const { data: deliveryItem, error } = await client
    .from("delivery_items")
    .select(
      `
      id,
      status,
      purchase_confirmed_at,
      order_items!inner (
        orders!inner (
          status,
          order_groups!inner ( user_id )
        )
      )
    `
    )
    .eq("id", deliveryItemId)
    .single();

  if (error || !deliveryItem) {
    throw new Error("상품을 찾을 수 없습니다.");
  }

  const order = deliveryItem.order_items.orders;

  if (order.order_groups.user_id !== userId) {
    throw new Error("본인 주문만 구매확정할 수 있습니다.");
  }
  if (order.status !== "delivered") {
    throw new Error("배송 완료된 상품만 구매확정할 수 있습니다.");
  }
  if (deliveryItem.status !== "normal") {
    throw new Error("반품/교환 처리 중이거나 완료된 상품은 구매확정할 수 없습니다.");
  }
  if (deliveryItem.purchase_confirmed_at) {
    throw new Error("이미 구매확정된 상품입니다.");
  }

  const { error: updateError } = await client
    .from("delivery_items")
    .update({ purchase_confirmed_at: new Date().toISOString() })
    .eq("id", deliveryItemId);

  if (updateError) throw updateError;

  return { deliveryItemId };
};

/**
 * 반품 신청 (구매자, delivery_item 단위)
 *
 * 배송완료 후 ~ 구매확정 전, 반품기간(사유별 7일/30일) 이내에만 신청 가능.
 * 신청은 상태 전이만 한다 — 실제 환불/재고복원은 판매자 승인(kend-seller,
 * status를 returned로 변경) 이후 kend의 환불 크론(processApprovedReturns)이 처리한다.
 */
export const requestReturn = async (
  client: Client,
  {
    userId,
    deliveryItemId,
    reason,
  }: { userId: string; deliveryItemId: string; reason: ReturnReasonType }
) => {
  const { data: deliveryItem, error } = await client
    .from("delivery_items")
    .select(
      `
      id,
      status,
      purchase_confirmed_at,
      order_items!inner (
        orders!inner (
          status,
          order_groups!inner ( user_id )
        )
      ),
      deliveries!inner ( delivered_at )
    `
    )
    .eq("id", deliveryItemId)
    .single();

  if (error || !deliveryItem) {
    throw new Error("반품 대상을 찾을 수 없습니다.");
  }

  const order = deliveryItem.order_items.orders;

  if (order.order_groups.user_id !== userId) {
    throw new Error("본인 주문만 반품 신청할 수 있습니다.");
  }
  if (deliveryItem.status !== "normal") {
    throw new Error("이미 반품/교환 처리 중이거나 완료된 상품입니다.");
  }
  if (order.status !== "delivered") {
    throw new Error("배송 완료된 상품만 반품 신청할 수 있습니다.");
  }
  if (deliveryItem.purchase_confirmed_at) {
    throw new Error("구매확정 후에는 반품 대신 문의하기(AS)로 접수해 주세요.");
  }

  const deliveredAt = deliveryItem.deliveries.delivered_at;
  if (!deliveredAt) {
    throw new Error("배송완료 정보를 확인할 수 없습니다.");
  }
  const windowDays = RETURN_WINDOW_DAYS[reason];
  const deadline = new Date(deliveredAt);
  deadline.setDate(deadline.getDate() + windowDays);
  if (new Date() > deadline) {
    throw new Error(`반품 신청 기한(배송완료 후 ${windowDays}일)이 지났습니다.`);
  }

  const { error: updateError } = await client
    .from("delivery_items")
    .update({ status: "return_requested", reason })
    .eq("id", deliveryItemId);

  if (updateError) throw updateError;

  return { deliveryItemId };
};
