import { processApprovedReturns } from "~/features/orders/mutations.server";
import type { Route } from "./+types/process-returns-cron";

/**
 * 반품 환불 처리 크론 엔드포인트 (P2.5-3)
 *
 * 사용자 세션이 없는 서버간 호출 전용 — pg_cron(pg_net)이 CRON_SECRET을 헤더에 실어
 * 주기 호출한다. kend-seller가 반품 승인 시 delivery_items.status만 'returned'로
 * 바꿔두면(Toss 시크릿이 없어 환불을 직접 못 함) 여기서 실제 환불을 처리한다.
 */
export const action = async ({ request }: Route.ActionArgs) => {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await processApprovedReturns();
  return Response.json(result);
};
