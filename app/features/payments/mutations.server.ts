/**
 * TossPayments 서버 사이드 유틸리티
 * .server.ts 접미사로 서버 번들에만 포함 (TOSS_SECRET_KEY 보호)
 */

interface ConfirmPaymentParams {
  paymentKey: string;
  orderId: string;
  amount: number;
}

interface TossApiResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

/**
 * TossPayments 결제 확인 API 호출
 * https://docs.tosspayments.com/reference#결제-승인
 */
export async function confirmPayment({
  paymentKey,
  orderId,
  amount,
}: ConfirmPaymentParams): Promise<TossApiResult> {
  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    console.error("TOSS_SECRET_KEY is not configured");
    return { success: false, error: "결제 설정 오류입니다." };
  }

  const authorization = `Basic ${Buffer.from(secretKey + ":").toString("base64")}`;

  try {
    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("TossPayments confirm failed:", data);
      return {
        success: false,
        error: data.message ?? "결제 확인에 실패했습니다.",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("TossPayments confirm error:", error);
    return { success: false, error: "결제 서버 연결에 실패했습니다." };
  }
}

interface CancelPaymentParams {
  paymentKey: string;
  cancelReason: string;
  /** 미지정 시 전액 취소. 부분 취소는 배송 도입 이후 사용 예정 */
  cancelAmount?: number;
  /**
   * 멱등키. 같은 키로 재요청하면 Toss가 최초 결과를 그대로 반환하므로
   * 네트워크 실패/재시도 시에도 이중 환불이 발생하지 않는다.
   */
  idempotencyKey?: string;
}

/**
 * TossPayments 결제 취소 API 호출
 * https://docs.tosspayments.com/reference#결제-취소
 */
export async function cancelPayment({
  paymentKey,
  cancelReason,
  cancelAmount,
  idempotencyKey,
}: CancelPaymentParams): Promise<TossApiResult> {
  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    console.error("TOSS_SECRET_KEY is not configured");
    return { success: false, error: "결제 설정 오류입니다." };
  }

  const authorization = `Basic ${Buffer.from(secretKey + ":").toString("base64")}`;

  const headers: Record<string, string> = {
    Authorization: authorization,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  try {
    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(
          cancelAmount != null
            ? { cancelReason, cancelAmount }
            : { cancelReason }
        ),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("TossPayments cancel failed:", data);
      return {
        success: false,
        error: data.message ?? "결제 취소에 실패했습니다.",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("TossPayments cancel error:", error);
    return { success: false, error: "결제 서버 연결에 실패했습니다." };
  }
}

/**
 * TossPayments 결제수단을 DB payment_method_type enum으로 매핑
 * https://docs.tosspayments.com/reference#payment-객체
 */
export function mapTossMethodToEnum(
  tossMethod: string
): "bank_transfer" | "credit_card" | "mobile_payment" | "easy_pay" | "virtual_account" {
  switch (tossMethod) {
    case "카드":
      return "credit_card";
    case "가상계좌":
      return "virtual_account";
    case "계좌이체":
      return "bank_transfer";
    case "휴대폰":
      return "mobile_payment";
    case "간편결제":
      return "easy_pay";
    case "토스페이":
      return "easy_pay";
    default:
      return "credit_card";
  }
}
