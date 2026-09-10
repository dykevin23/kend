import { redirect } from "react-router";
import type { Route } from "./+types/payment-fail-page";
import { makeSSRClient } from "~/supa-client";

/**
 * 결제 실패 콜백 페이지 (TossPayments → 리다이렉트)
 *
 * 이 페이지는 컴포넌트를 렌더링하지 않고 loader에서 모든 처리 후 redirect합니다.
 * → 브라우저 히스토리에 이 URL이 남지 않아 뒤로가기 문제가 없음
 */
// 사용자가 결제창에서 직접 취소/닫기 한 경우의 Toss 에러 코드 — 실패(에러)가 아니라 이탈이다
const USER_CANCEL_CODES = new Set([
  "PAY_PROCESS_CANCELED",
  "USER_CANCEL",
  "PAY_PROCESS_ABORTED",
]);

// returnTo는 결제 시작 지점(장바구니/상품상세 등)의 내부 경로. 오픈 리다이렉트 방지를 위해
// 반드시 단일 슬래시로 시작하는 내부 경로만 허용한다.
const safeReturnPath = (raw: string | null): string => {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/carts";
  if (raw.includes("://") || raw.includes("\\")) return "/carts";
  return raw;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const message = url.searchParams.get("message");
  const orderId = url.searchParams.get("orderId");
  const returnTo = safeReturnPath(url.searchParams.get("returnTo"));

  // order_group 상태를 failed로 업데이트 (취소든 실패든 미결제 주문은 정리)
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

  const sep = returnTo.includes("?") ? "&" : "?";

  // 사용자가 스스로 취소한 경우 — 시작 지점으로 조용히 복귀 (에러 아님)
  if (code && USER_CANCEL_CODES.has(code)) {
    return redirect(`${returnTo}${sep}payment_cancelled=1`);
  }

  // 실제 결제 실패 — 시작 지점으로 복귀 + 에러 메시지 (히스토리에 이 페이지 안 남음)
  const errorMessage = message || "결제 처리 중 오류가 발생했습니다.";
  return redirect(
    `${returnTo}${sep}payment_error=${encodeURIComponent(errorMessage)}`
  );
};

/**
 * 컴포넌트는 loader에서 항상 redirect하므로 렌더링되지 않음.
 * React Router 라우트 등록을 위해 default export 유지.
 */
export default function PaymentFailPage() {
  return null;
}
