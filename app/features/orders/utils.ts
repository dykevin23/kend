/**
 * 개별 주문(판매자별) 상태 라벨
 */
export function getOrderStatusLabel(status: string): {
  label: string;
  color: string;
} {
  switch (status) {
    case "pending":
      return { label: "주문접수", color: "text-gray-600" };
    case "confirmed":
      return { label: "주문확인", color: "text-blue-600" };
    case "preparing":
      return { label: "상품준비중", color: "text-blue-600" };
    case "shipped":
      return { label: "배송시작", color: "text-blue-600" };
    case "delivered":
      return { label: "배송완료", color: "text-green-600" };
    case "cancelled":
      return { label: "취소", color: "text-gray-500" };
    default:
      return { label: "주문접수", color: "text-gray-600" };
  }
}

export interface ReturnStatusInfo {
  deliveryItemStatus: string | null;
  returnApprovedAt: string | null;
  returnReceivedAt: string | null;
  returnRejectReason: string | null;
  returnRefundedAt: string | null;
}

/**
 * 반품/교환 진행 상태 라벨
 *
 * status는 검수 완료(최종 확정) 전까지 'return_requested'에 머물러 있고, 그 사이의
 * 세부 진행(1차승인/회수확인/거절)은 return_approved_at/return_received_at/reject_reason으로만
 * 표현된다 (P2.5-3). getOrderStatusLabel과 동일한 { label, color } 형태로 반환해서
 * 같은 배지 스타일로 통일해서 보여줄 수 있게 한다.
 */
export function getReturnStatusLabel(
  item: ReturnStatusInfo
): { label: string; color: string } | null {
  if (!item.deliveryItemStatus || item.deliveryItemStatus === "normal") {
    return null;
  }

  if (item.deliveryItemStatus === "return_requested") {
    if (item.returnRejectReason) {
      return { label: `반품 거절: ${item.returnRejectReason}`, color: "text-red-600" };
    }
    if (item.returnReceivedAt) {
      return { label: "반품 승인됨 (검수 중)", color: "text-orange-600" };
    }
    if (item.returnApprovedAt) {
      return {
        label: "반품 승인됨 (반송 택배를 보내주세요)",
        color: "text-orange-600",
      };
    }
    return { label: "반품 신청됨 (판매자 확인 대기)", color: "text-orange-600" };
  }

  if (item.deliveryItemStatus === "returned") {
    return item.returnRefundedAt
      ? { label: "반품 완료 (환불 처리됨)", color: "text-gray-500" }
      : { label: "반품 승인됨 (환불 처리 중)", color: "text-orange-600" };
  }

  if (item.deliveryItemStatus === "exchange_requested") {
    return { label: "교환 신청됨", color: "text-orange-600" };
  }
  if (item.deliveryItemStatus === "exchanged") {
    return { label: "교환 완료", color: "text-gray-500" };
  }

  return null;
}

export interface ConfirmPurchaseCandidate {
  deliveryItemId: string | null;
  deliveryItemStatus: string | null;
  purchaseConfirmedAt: string | null;
}

/**
 * 주문(판매자) 내 구매확정 버튼을 개별로 보여줄지, 전체 구매확정 버튼 하나로
 * 묶을지 판단한다. 상품이 전부 정상 상태(반품 등으로 갈리지 않음)면 미확정
 * 건을 한 번에 처리하는 전체 구매확정 버튼을 쓴다. 하나라도 상태가 갈리면
 * (반품 등) 그 순간부터 상품별 개별 버튼으로 돌아간다 — 대상이 1개면 굳이
 * "전체" 버튼을 쓸 이유가 없어 그 경우도 개별 버튼 쪽으로 둔다.
 * 주문상세/주문목록/전체탭 3곳에서 동일하게 사용.
 */
export function getConfirmPurchaseGroup(
  items: ConfirmPurchaseCandidate[],
  orderStatus: string
): { useBulkConfirm: boolean; unconfirmedNormalItemIds: string[] } {
  const allNormal = items.every((item) => item.deliveryItemStatus === "normal");
  const unconfirmedNormalItemIds = items
    .filter(
      (item) =>
        item.deliveryItemStatus === "normal" &&
        orderStatus === "delivered" &&
        !item.purchaseConfirmedAt &&
        !!item.deliveryItemId
    )
    .map((item) => item.deliveryItemId!);

  return {
    useBulkConfirm: allNormal && unconfirmedNormalItemIds.length > 1,
    unconfirmedNormalItemIds,
  };
}

/**
 * 상품(delivery_item) 하나의 최종 상태 배지
 * 반품/교환이 진행중이면 그 상태를, 아니면 주문(orders) 상태를 보여준다 —
 * 같은 주문 안에서도 상품마다 상태가 다를 수 있어(P2.5-3) 상품 단위로 판단한다.
 */
export function getItemStatusLabel(
  orderStatus: string,
  item: ReturnStatusInfo
): { label: string; color: string } {
  return getReturnStatusLabel(item) ?? getOrderStatusLabel(orderStatus);
}
