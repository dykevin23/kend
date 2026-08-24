import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 주문 내역 탭 필터 타입
 *
 * "결제대기"는 별도 탭 없이 "주문접수"에 흡수됐다 — 결제(무통장입금 등)가
 * 아직 안 끝났어도 주문 자체는 한 것이므로, 주문 이후~배송중 전 구간을
 * 하나로 묶어서 보여준다.
 */
export type OrderTabFilter =
  | "all"
  | "order_received"
  | "in_delivery"
  | "delivered"
  | "cancelled";

/** "주문접수" 탭 — 결제완료(또는 결제대기) 이후, 아직 발송 전 */
const ORDER_RECEIVED_STATUSES = ["pending", "preparing"];
/** "배송중" 탭 — 실제로 발송된 이후 (배송완료/반송중 제외) */
const IN_DELIVERY_STATUSES = ["shipped", "in_transit"];
/** 판매자 응답 대기중이거나 종결된 반품/교환 상태 — 취소/환불 탭 대상 */
const RETURN_OR_EXCHANGE_STATUSES = [
  "return_requested",
  "returned",
  "exchange_requested",
  "exchanged",
];

type RawOrderItem = {
  id: string;
  product_code: string;
  product_name: string;
  options: unknown;
  main_image: string | null;
  sale_price: number;
  quantity: number;
  subtotal: number;
};

type RawDeliveryItem = {
  id: string;
  order_item_id: string;
  status: string;
  reason: string | null;
  return_approved_at: string | null;
  return_received_at: string | null;
  reject_reason: string | null;
  refunded_at: string | null;
};

const mapOrderItem = (
  item: RawOrderItem,
  deliveryItems: RawDeliveryItem[]
) => {
  const deliveryItem = deliveryItems.find(
    (di) => di.order_item_id === item.id
  );
  return {
    id: item.id,
    productCode: item.product_code,
    productName: item.product_name,
    options: item.options as Record<string, string> | null,
    mainImage: item.main_image,
    salePrice: item.sale_price,
    quantity: item.quantity,
    subtotal: item.subtotal,
    deliveryItemId: deliveryItem?.id ?? null,
    deliveryItemStatus: deliveryItem?.status ?? null,
    returnReason: deliveryItem?.reason ?? null,
    returnApprovedAt: deliveryItem?.return_approved_at ?? null,
    returnReceivedAt: deliveryItem?.return_received_at ?? null,
    returnRejectReason: deliveryItem?.reject_reason ?? null,
    returnRefundedAt: deliveryItem?.refunded_at ?? null,
  };
};

export type UserOrderItem = ReturnType<typeof mapOrderItem>;

export interface UserOrderCard {
  orderGroupId: string;
  orderGroupCreatedAt: string;
  orderNumber: string;
  order: {
    id: string;
    sellerName: string;
    status: string;
  };
  items: UserOrderItem[];
}

/**
 * 사용자 주문 그룹 목록 조회
 *
 * "전체" 탭만 order_group 단위(판매자별 orders 중첩)로 그대로 반환하고,
 * "주문접수"/"배송중"/"배송완료"/"취소·환불" 탭은 orders(판매자 단위) 카드로
 * 평탄화해서 반환한다 — 판매자 주문 안에서도 상품별로 배송/반품 상태가 갈릴 수
 * 있어서(P2.5-3), order_group·orders 단위로 탭을 나누면 다른 상품 상태가 섞여
 * 보이는 문제가 생긴다.
 *
 * deliveries/delivery_items는 스키마상 주문당 여러 건(분할배송) 허용이지만, 현재
 * createOrder가 주문당 정확히 1건만 생성하고 그 외 어디서도 추가 INSERT가 없어
 * "orders 1건 = deliveries 1건"을 전제로 한다 (getOrderGroupDetail과 동일 전제).
 *
 * 주문취소(handle_order_cancelled 트리거)는 deliveries/delivery_items 상태를 건드리지
 * 않으므로, 주문접수/배송중/배송완료 판정 전에 반드시 orders.status !== 'cancelled'를
 * 먼저 걸러야 한다 — 안 그러면 취소된 주문의 delivery.status='pending'이 계속 남아
 * 주문접수 탭에서 사라지지 않는다.
 *
 * "결제대기"(payment_pending)는 별도 탭 없이 흡수됐다 — 결제 미완료 상태여도
 * createOrder 시점에 orders/deliveries가 이미 'pending'으로 생성돼 있어서 특별
 * 처리 없이도 자연스럽게 "주문접수" 버킷에 들어간다.
 *
 * deliveries.status='returning'(반송중, RTS·장기미수령용)은 아직 세팅하는 코드가
 * 없지만, 도입되면 취소/환불 탭으로 들어가게 미리 반영해둔다.
 */
export const getUserOrderGroups = async (
  client: Client,
  userId: string,
  filter: OrderTabFilter = "all"
): Promise<
  | { kind: "grouped"; orderGroups: UserOrderGroup[] }
  | { kind: "cards"; cards: UserOrderCard[] }
> => {
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
          product_code,
          product_name,
          options,
          main_image,
          sale_price,
          quantity,
          subtotal
        ),
        deliveries (
          status,
          courier,
          tracking_number,
          delivered_at,
          delivery_items (
            id,
            order_item_id,
            status,
            reason,
            return_approved_at,
            return_received_at,
            reject_reason,
            refunded_at
          )
        )
      )
    `
    )
    .eq("user_id", userId)
    .not("status", "in", '("payment_in_progress","failed")');

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;

  if (filter === "all") {
    return {
      kind: "grouped",
      orderGroups: data.map((group) => ({
        id: group.id,
        orderNumber: group.order_number,
        status: group.status,
        totalAmount: group.total_amount,
        createdAt: group.created_at,
        orders: group.orders.map((order) => {
          const deliveryItems = order.deliveries[0]?.delivery_items ?? [];
          return {
            id: order.id,
            sellerName: order.seller_name,
            status: order.status,
            items: order.order_items.map((item) =>
              mapOrderItem(item, deliveryItems)
            ),
          };
        }),
      })),
    };
  }

  // order_received / in_delivery / delivered / cancelled — orders(판매자 단위) 카드로 평탄화
  const cards: UserOrderCard[] = [];

  const pushCard = (
    group: (typeof data)[number],
    order: (typeof data)[number]["orders"][number],
    items: UserOrderItem[]
  ) => {
    cards.push({
      orderGroupId: group.id,
      orderGroupCreatedAt: group.created_at,
      orderNumber: group.order_number,
      order: { id: order.id, sellerName: order.seller_name, status: order.status },
      items,
    });
  };

  for (const group of data) {
    for (const order of group.orders) {
      const deliveryItems = order.deliveries[0]?.delivery_items ?? [];
      const mappedItems = order.order_items.map((item) =>
        mapOrderItem(item, deliveryItems)
      );
      const delivery = order.deliveries[0];

      if (filter === "cancelled") {
        // 발송전 취소(주문 전체) 또는 반송중(RTS) — 상품 전체를 한 카드로
        if (order.status === "cancelled" || delivery?.status === "returning") {
          pushCard(group, order, mappedItems);
          continue;
        }
        const returnItems = mappedItems.filter(
          (item) =>
            item.deliveryItemStatus &&
            RETURN_OR_EXCHANGE_STATUSES.includes(item.deliveryItemStatus)
        );
        if (returnItems.length > 0) {
          pushCard(group, order, returnItems);
        }
        continue;
      }

      // 취소된 주문은 order_received/in_delivery/delivered 어디에도 안 보인다
      if (order.status === "cancelled") continue;

      if (filter === "order_received") {
        if (delivery && ORDER_RECEIVED_STATUSES.includes(delivery.status)) {
          pushCard(group, order, mappedItems);
        }
      } else if (filter === "in_delivery") {
        if (delivery && IN_DELIVERY_STATUSES.includes(delivery.status)) {
          pushCard(group, order, mappedItems);
        }
      } else if (filter === "delivered") {
        if (delivery && delivery.status === "delivered") {
          const normalItems = mappedItems.filter(
            (item) => item.deliveryItemStatus === "normal"
          );
          if (normalItems.length > 0) {
            pushCard(group, order, normalItems);
          }
        }
      }
    }
  }

  return { kind: "cards", cards };
};

export interface UserOrderGroup {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orders: UserOrder[];
}
export interface UserOrder {
  id: string;
  sellerName: string;
  status: string;
  items: UserOrderItem[];
}

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
        confirmed_at,
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
        ),
        deliveries (
          id,
          status,
          courier,
          tracking_number,
          shipped_at,
          delivered_at,
          delivery_items (
            id,
            order_item_id,
            status,
            reason,
            return_approved_at,
            return_received_at,
            reject_reason,
            refunded_at,
            purchase_confirmed_at
          )
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
      confirmedAt: order.confirmed_at,
      delivery: order.deliveries[0]
        ? {
            status: order.deliveries[0].status,
            courier: order.deliveries[0].courier,
            trackingNumber: order.deliveries[0].tracking_number,
            shippedAt: order.deliveries[0].shipped_at,
            deliveredAt: order.deliveries[0].delivered_at,
          }
        : null,
      items: order.order_items.map((item) => {
        const deliveryItem = order.deliveries[0]?.delivery_items.find(
          (di) => di.order_item_id === item.id
        );
        return {
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
          deliveryItemId: deliveryItem?.id ?? null,
          deliveryItemStatus: deliveryItem?.status ?? null,
          returnReason: deliveryItem?.reason ?? null,
          returnApprovedAt: deliveryItem?.return_approved_at ?? null,
          returnReceivedAt: deliveryItem?.return_received_at ?? null,
          returnRejectReason: deliveryItem?.reject_reason ?? null,
          returnRefundedAt: deliveryItem?.refunded_at ?? null,
          purchaseConfirmedAt: deliveryItem?.purchase_confirmed_at ?? null,
        };
      }),
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
