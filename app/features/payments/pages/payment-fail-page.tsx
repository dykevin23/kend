import { redirect } from "react-router";
import type { Route } from "./+types/payment-fail-page";
import { makeSSRClient } from "~/supa-client";

/**
 * 결제 실패 콜백 페이지 (TossPayments → 리다이렉트)
 *
 * 이 페이지는 컴포넌트를 렌더링하지 않고 loader에서 모든 처리 후 redirect합니다.
 * → 브라우저 히스토리에 이 URL이 남지 않아 뒤로가기 문제가 없음
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const message = url.searchParams.get("message");
  const orderId = url.searchParams.get("orderId");

  // order_group 상태를 failed로 업데이트
  if (orderId) {
    const { client } = makeSSRClient(request);
    const {
      data: { user },
    } = await client.auth.getUser();

    if (user) {
      await client
        .from("order_groups")
        .update({ status: "failed" })
        .eq("order_number", orderId)
        .eq("user_id", user.id);
    }
  }

  // 장바구니로 redirect (히스토리에 이 페이지 안 남음)
  const errorMessage = message || "결제 처리 중 오류가 발생했습니다.";
  return redirect("/carts?payment_error=" + encodeURIComponent(errorMessage));
};

/**
 * 컴포넌트는 loader에서 항상 redirect하므로 렌더링되지 않음.
 * React Router 라우트 등록을 위해 default export 유지.
 */
export default function PaymentFailPage() {
  return null;
}
