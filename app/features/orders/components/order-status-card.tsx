import { Link } from "react-router";
import { DateTime } from "luxon";
import type { UserOrderCard } from "../queries";
import type { ReviewedDeliveryItem } from "~/features/reviews/queries";
import OrderItemCard from "./order-item-card";
import {
  ConfirmPurchaseButton,
  BulkConfirmPurchaseButton,
} from "./confirm-purchase-button";
import ReviewWriteButton from "~/features/reviews/components/review-write-button";
import { Button } from "~/common/components/ui/button";
import { getItemStatusLabel, getConfirmPurchaseGroup } from "../utils";

interface OrderStatusCardProps {
  card: UserOrderCard;
  reviewedDeliveryItems: ReviewedDeliveryItem[];
}

/**
 * 배송중/배송완료/취소·환불 탭 전용 카드
 *
 * order_group이 아니라 orders(판매자) 단위로 렌더링하고, 상품도 해당 탭에
 * 맞는 것만 표시한다(반품 진행중인 상품은 배송완료 탭에서 빠지고 취소/환불
 * 탭에만 나오는 식) — P2.5-3 실사용 테스트 중 발견된 이슈 수정.
 */
export default function OrderStatusCard({
  card,
  reviewedDeliveryItems,
}: OrderStatusCardProps) {
  const orderDate = DateTime.fromISO(card.orderGroupCreatedAt).toFormat(
    "yyyy. M. d"
  );

  // 구매확정된(normal + purchaseConfirmedAt) 건만 리뷰 버튼 대상 — 정책: 구매확정
  // 건(delivery_item)당 1개라 같은 상품도 구매확정 건이 다르면 각각 작성 가능.
  // 대상이 1개면 그 화면으로 바로 연결(단축), 여러 개면 상품별로 정확한 주문상세로 보낸다.
  const confirmedItems = card.items.filter(
    (item) => item.deliveryItemStatus === "normal" && !!item.purchaseConfirmedAt
  );
  const reviewableItems = confirmedItems.filter(
    (item) =>
      !reviewedDeliveryItems.some((r) => r.deliveryItemId === item.deliveryItemId)
  );
  const reviewedItems = confirmedItems
    .map((item) => ({
      item,
      review: reviewedDeliveryItems.find(
        (r) => r.deliveryItemId === item.deliveryItemId
      ),
    }))
    .filter((x) => x.review);

  const { useBulkConfirm, unconfirmedNormalItemIds } = getConfirmPurchaseGroup(
    card.items,
    card.order.status
  );

  const singleReviewableItem =
    reviewableItems.length === 1 ? reviewableItems[0] : null;

  const reviewButton = (() => {
    if (reviewableItems.length > 1) {
      return {
        label: `리뷰 작성 (${reviewableItems.length})`,
        to: `/orders/${card.orderGroupId}`,
        replace: false,
      };
    }
    if (reviewedItems.length === 1) {
      return {
        label: "내가 쓴 리뷰 보기",
        to: `/myPage/reviews?reviewId=${reviewedItems[0].review!.reviewId}`,
        replace: false,
      };
    }
    if (reviewedItems.length > 1) {
      return {
        label: `내가 쓴 리뷰 보기 (${reviewedItems.length})`,
        to: `/orders/${card.orderGroupId}`,
        replace: false,
      };
    }
    return null;
  })();

  return (
    <div className="bg-white">
      {/* 헤더: 날짜 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-base font-bold text-gray-900">{orderDate}</span>
      </div>

      {/* 상품 목록 — 상품마다 상태가 다를 수 있어(P2.5-3) 상품별로 배지를 보여준다 */}
      <div className="px-4">
        {card.items.map((item) => {
          const status = getItemStatusLabel(card.order.status, item);
          return (
            <div key={item.id}>
              <div className="pt-4 pb-2">
                <span className={`text-sm font-bold ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <OrderItemCard item={item} sellerName={card.order.sellerName} />
            </div>
          );
        })}
      </div>

      <div className="flex px-4 py-3 gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
          <Link to={`/orders/${card.orderGroupId}`}>배송·주문 관리</Link>
        </Button>
        {singleReviewableItem ? (
          <ReviewWriteButton
            productId={singleReviewableItem.productId!}
            deliveryItemId={singleReviewableItem.deliveryItemId!}
            productName={singleReviewableItem.productName}
            mainImage={singleReviewableItem.mainImage}
            options={singleReviewableItem.options}
            salePrice={singleReviewableItem.salePrice}
            className="flex-1"
          />
        ) : (
          reviewButton && (
            <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
              <Link to={reviewButton.to} replace={reviewButton.replace}>
                {reviewButton.label}
              </Link>
            </Button>
          )
        )}
      </div>

      {useBulkConfirm ? (
        <div className="px-4 pb-3">
          <BulkConfirmPurchaseButton deliveryItemIds={unconfirmedNormalItemIds} />
        </div>
      ) : (
        unconfirmedNormalItemIds.length > 0 && (
          <div className="flex flex-col gap-2 px-4 pb-3">
            {unconfirmedNormalItemIds.map((id) => (
              <ConfirmPurchaseButton key={id} deliveryItemId={id} className="w-full" />
            ))}
          </div>
        )
      )}
    </div>
  );
}
