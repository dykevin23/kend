import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import type { Json } from "database.types";
import { cancelPayment } from "~/features/payments/mutations.server";

type Client = SupabaseClient<Database>;

/** 배송이 시작된 이후 상태 — 구매자가 직접 취소할 수 없다 */
const SHIPPED_ORDER_STATUSES = ["shipped", "delivered"];

interface CancelOrderGroupParams {
  userId: string;
  orderGroupId: string;
  cancelReason: string;
}

/**
 * 취소 확정을 DB에 반영한다 (order_groups / orders / delivery_items / payments).
 *
 * ⚠️ 현재는 순차 update라 원자성이 없다. 중간 실패 시 "환불은 됐는데 상태는 paid"인
 *    불일치가 남을 수 있고, 이는 결제-주문 무결성 체크(P4-3)로 잡는 것을 전제한다.
 *    추후 Postgres RPC(트랜잭션) 호출 한 번으로 교체할 예정이며,
 *    그때 이 함수 내부만 바꾸면 된다 (호출부 변경 불필요).
 */
const applyCancellationToDb = async (
  client: Client,
  {
    orderGroupId,
    orderIds,
    paymentKey,
    paymentData,
  }: {
    orderGroupId: string;
    orderIds: string[];
    paymentKey: string;
    paymentData?: Record<string, unknown>;
  }
) => {
  // 배송 전 구매자 취소는 cancelled. (반품 환불용 refunded 와 구분해서 기록)
  await client
    .from("order_groups")
    .update({ status: "cancelled" })
    .eq("id", orderGroupId);

  if (orderIds.length > 0) {
    await client
      .from("orders")
      .update({ status: "cancelled" })
      .in("id", orderIds);

    // delivery_items 는 부분취소/교환의 기준 단위 → 함께 취소 처리
    const { data: deliveries } = await client
      .from("deliveries")
      .select("id")
      .in("order_id", orderIds);

    const deliveryIds = (deliveries ?? []).map((delivery) => delivery.id);
    if (deliveryIds.length > 0) {
      await client
        .from("delivery_items")
        .update({ status: "cancelled" })
        .in("delivery_id", deliveryIds);
    }
  }

  // 취소 응답으로 결제 상세 갱신 (status: DONE → CANCELED)
  await client
    .from("payments")
    .update({
      status: (paymentData?.status as string) ?? "CANCELED",
      raw_response: (paymentData ?? null) as Json,
    })
    .eq("payment_key", paymentKey);
};

/**
 * 주문 그룹 전체 취소 (전액 환불)
 *
 * 결제가 order_group 단위(paymentKey 1개)이므로 취소도 그룹 전체를 대상으로 한다.
 * 즉 한 번의 결제로 산 모든 판매자/상품이 함께 취소된다.
 * 부분 취소(상품·판매자 단위)는 배송(delivery_items) 도입 이후 별도 구현.
 *
 * 1. 소유·상태 검증 → 2. TossPayments 취소 → 3. DB 반영
 */
export const cancelOrderGroup = async (
  client: Client,
  { userId, orderGroupId, cancelReason }: CancelOrderGroupParams
) => {
  // 1. 본인 주문만 조회
  const { data: orderGroup, error: queryError } = await client
    .from("order_groups")
    .select("id, order_number, status, payment_key, orders (id, status)")
    .eq("id", orderGroupId)
    .eq("user_id", userId)
    .single();

  if (queryError || !orderGroup) {
    throw new Error("주문을 찾을 수 없습니다.");
  }

  // 2. 취소 가능 상태 검증 (이미 취소된 주문의 재취소도 여기서 막힌다)
  if (orderGroup.status !== "paid") {
    throw new Error("결제 완료된 주문만 취소할 수 있습니다.");
  }
  if (
    orderGroup.orders.some((order) =>
      SHIPPED_ORDER_STATUSES.includes(order.status)
    )
  ) {
    throw new Error("배송이 시작된 주문은 취소할 수 없습니다.");
  }
  if (!orderGroup.payment_key) {
    throw new Error("결제 정보를 찾을 수 없어 취소할 수 없습니다.");
  }

  // 3. TossPayments 전액 취소. 멱등키로 재시도 시 이중 환불을 방지한다.
  const result = await cancelPayment({
    paymentKey: orderGroup.payment_key,
    cancelReason,
    idempotencyKey: `cancel-${orderGroup.id}`,
  });

  if (!result.success) {
    throw new Error(result.error ?? "결제 취소에 실패했습니다.");
  }

  // 4. 환불 성공 이후에만 DB 상태 전환
  await applyCancellationToDb(client, {
    orderGroupId: orderGroup.id,
    orderIds: orderGroup.orders.map((order) => order.id),
    paymentKey: orderGroup.payment_key,
    paymentData: result.data,
  });

  return {
    orderGroupId: orderGroup.id,
    orderNumber: orderGroup.order_number,
  };
};
