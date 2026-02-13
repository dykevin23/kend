import { redirect } from "react-router";
import type { Route } from "./+types/payment-success-page";
import { makeSSRClient } from "~/supa-client";
import {
  confirmPayment,
  mapTossMethodToEnum,
} from "~/features/payments/mutations.server";

/**
 * 결제 성공 콜백 페이지 (TossPayments → 리다이렉트)
 *
 * 이 페이지는 컴포넌트를 렌더링하지 않고 loader에서 모든 처리 후 redirect합니다.
 * → 브라우저 히스토리에 이 URL이 남지 않아 뒤로가기 문제가 없음
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const paymentKey = url.searchParams.get("paymentKey");
  const orderId = url.searchParams.get("orderId");
  const amount = Number(url.searchParams.get("amount"));

  if (!paymentKey || !orderId || !amount) {
    return redirect("/carts?payment_error=" + encodeURIComponent("잘못된 결제 정보입니다."));
  }

  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/carts?payment_error=" + encodeURIComponent("로그인이 필요합니다."));
  }

  // 1. order_group 조회 및 금액 검증
  const { data: orderGroup, error: queryError } = await client
    .from("order_groups")
    .select("id, total_amount, status")
    .eq("order_number", orderId)
    .eq("user_id", user.id)
    .single();

  if (queryError || !orderGroup) {
    return redirect("/carts?payment_error=" + encodeURIComponent("주문 정보를 찾을 수 없습니다."));
  }

  // 이미 결제 완료된 주문인지 확인
  if (orderGroup.status === "paid") {
    return redirect(`/orders?payment_success=true&orderNumber=${orderId}&amount=${amount}`);
  }

  if (orderGroup.total_amount !== amount) {
    await client
      .from("order_groups")
      .update({ status: "failed" })
      .eq("id", orderGroup.id);
    return redirect("/carts?payment_error=" + encodeURIComponent("결제 금액이 일치하지 않습니다."));
  }

  // 2. TossPayments Confirm API 호출
  const confirmResult = await confirmPayment({ paymentKey, orderId, amount });

  if (!confirmResult.success) {
    await client
      .from("order_groups")
      .update({ status: "failed" })
      .eq("id", orderGroup.id);
    return redirect(
      "/carts?payment_error=" + encodeURIComponent(confirmResult.error ?? "결제 확인에 실패했습니다.")
    );
  }

  // 3. order_group 상태 업데이트
  const paymentData = confirmResult.data as Record<string, unknown> | undefined;
  const tossMethod = (paymentData?.method as string) ?? "";
  const paymentMethod = mapTossMethodToEnum(tossMethod);

  await client
    .from("order_groups")
    .update({
      status: "paid",
      payment_key: paymentKey,
      payment_method: paymentMethod,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderGroup.id);

  // 4. payments 테이블에 결제 상세 정보 저장
  const card = paymentData?.card as Record<string, unknown> | null;
  const easyPay = paymentData?.easyPay as Record<string, unknown> | null;
  const receipt = paymentData?.receipt as Record<string, unknown> | null;

  await client.from("payments").insert({
    order_group_id: orderGroup.id,
    payment_key: paymentKey,
    order_id: orderId,
    method: tossMethod || null,
    status: (paymentData?.status as string) ?? "DONE",
    total_amount: amount,
    requested_at: (paymentData?.requestedAt as string) ?? null,
    approved_at: (paymentData?.approvedAt as string) ?? null,
    card_issuer_code: (card?.issuerCode as string) ?? null,
    card_acquirer_code: (card?.acquirerCode as string) ?? null,
    card_number: (card?.number as string) ?? null,
    card_installment_plan_months: (card?.installmentPlanMonths as number) ?? null,
    card_approve_no: (card?.approveNo as string) ?? null,
    card_type: (card?.cardType as string) ?? null,
    card_owner_type: (card?.ownerType as string) ?? null,
    easy_pay_provider: (easyPay?.provider as string) ?? null,
    easy_pay_amount: (easyPay?.amount as number) ?? null,
    easy_pay_discount_amount: (easyPay?.discountAmount as number) ?? null,
    receipt_url: (receipt?.url as string) ?? null,
    raw_response: paymentData ?? null,
  });

  // 5. 장바구니 정리 (서버에서 처리)
  const { data: cartItems } = await client
    .from("carts")
    .select("id, sku_id")
    .eq("user_id", user.id);

  if (cartItems && cartItems.length > 0) {
    // 주문한 SKU ID 목록 조회
    const { data: orderItems } = await client
      .from("order_items")
      .select("sku_id, orders!inner(order_group_id)")
      .eq("orders.order_group_id", orderGroup.id);

    if (orderItems) {
      const orderedSkuIds = new Set(orderItems.map((item) => item.sku_id));
      const cartIdsToDelete = cartItems
        .filter((cart) => orderedSkuIds.has(cart.sku_id))
        .map((cart) => cart.id);

      if (cartIdsToDelete.length > 0) {
        await client.from("carts").delete().in("id", cartIdsToDelete);
      }
    }
  }

  // 결제 성공 → 주문 내역 페이지로 redirect (히스토리에 이 페이지 안 남음)
  return redirect(`/orders?payment_success=true&orderNumber=${orderId}&amount=${amount}`);
};

/**
 * 컴포넌트는 loader에서 항상 redirect하므로 렌더링되지 않음.
 * React Router 라우트 등록을 위해 default export 유지.
 */
export default function PaymentSuccessPage() {
  return null;
}
