import { redirect, useLoaderData, Link } from "react-router";
import { DateTime } from "luxon";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import { makeSSRClient } from "~/supa-client";
import { getOrderGroupDetail } from "../queries";
import OrderItemCard from "../components/order-item-card";
import ReturnRequestDialog from "../components/return-request-dialog";
import {
  ConfirmPurchaseButton,
  BulkConfirmPurchaseButton,
} from "../components/confirm-purchase-button";
import { getReturnStatusLabel, getConfirmPurchaseGroup } from "../utils";
import { getReviewedDeliveryItems } from "~/features/reviews/queries";
import ReviewWriteButton from "~/features/reviews/components/review-write-button";
import type { Route } from "./+types/order-detail-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw redirect("/auth/login");
  }

  const [orderGroup, reviewedDeliveryItems] = await Promise.all([
    getOrderGroupDetail(client, params.orderGroupId, user.id),
    getReviewedDeliveryItems(client, user.id),
  ]);

  return { orderGroup, reviewedDeliveryItems };
};

const formatDate = (value: string | null) =>
  value ? DateTime.fromISO(value).toFormat("yyyy.M.d HH:mm") : null;

/**
 * 판매자 단위 주문의 처리 타임라인
 */
function OrderTimeline({ order }: { order: Route.ComponentProps["loaderData"]["orderGroup"]["orders"][number] }) {
  const steps = [
    { label: "주문접수", at: null }, // order_group.createdAt으로 상단에서 이미 표시
    { label: "판매자확인", at: order.confirmedAt },
    { label: "발송", at: order.delivery?.shippedAt ?? null },
    { label: "배송완료", at: order.delivery?.deliveredAt ?? null },
  ].filter((step) => step.at !== null || step.label === "주문접수");

  return (
    <div className="flex flex-col gap-1.5 px-4 py-3 bg-gray-50 rounded-md">
      {steps
        .filter((step) => step.label !== "주문접수")
        .map((step) => (
          <div key={step.label} className="flex items-center justify-between text-xs">
            <span className="text-gray-600">{step.label}</span>
            <span className="text-gray-900">{formatDate(step.at)}</span>
          </div>
        ))}
      {order.delivery?.courier && order.delivery?.trackingNumber && (
        <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200 mt-1">
          <span className="text-gray-600">송장번호</span>
          <span className="text-gray-900">
            {order.delivery.courier} {order.delivery.trackingNumber}
          </span>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderGroup, reviewedDeliveryItems } = useLoaderData<typeof loader>();

  return (
    <Content headerPorps={{ title: "주문 상세", useRight: false }}>
      <div className="flex flex-col w-full bg-gray-50 min-h-full">
        {/* 주문/결제 정보 */}
        <div className="flex flex-col gap-1 px-4 py-4 bg-white border-b border-gray-100">
          <span className="text-sm font-bold">주문번호 {orderGroup.orderNumber}</span>
          <span className="text-xs text-gray-500">
            주문일시 {formatDate(orderGroup.createdAt)}
          </span>
          {orderGroup.paidAt && (
            <span className="text-xs text-gray-500">
              결제일시 {formatDate(orderGroup.paidAt)}
            </span>
          )}
        </div>

        {/* 배송지 */}
        <div className="flex flex-col gap-1 px-4 py-4 bg-white border-b border-gray-100 mt-2">
          <span className="text-sm font-bold mb-1">배송지</span>
          <span className="text-sm">{orderGroup.recipientName}</span>
          <span className="text-sm text-gray-600">{orderGroup.recipientPhone}</span>
          <span className="text-sm text-gray-600">
            ({orderGroup.zoneCode}) {orderGroup.address} {orderGroup.addressDetail}
          </span>
        </div>

        {/* 판매자별 주문 블록 */}
        {orderGroup.orders.map((order) => {
          const { useBulkConfirm, unconfirmedNormalItemIds } =
            getConfirmPurchaseGroup(order.items, order.status);

          return (
            <div key={order.id} className="flex flex-col bg-white border-b border-gray-100 mt-2">
              <div className="px-4 pt-4 pb-2">
                <span className="text-sm font-bold">{order.sellerName}</span>
              </div>

              <div className="px-4">
                {order.items.map((item) => {
                  const isNormal = item.deliveryItemStatus === "normal";
                  const canRequestReturn =
                    order.status === "delivered" &&
                    !item.purchaseConfirmedAt &&
                    item.deliveryItemId &&
                    isNormal;
                  const canConfirmPurchase =
                    !useBulkConfirm &&
                    order.status === "delivered" &&
                    isNormal &&
                    !item.purchaseConfirmedAt;
                  const returnStatusLabel = getReturnStatusLabel(item);
                  const isConfirmed = isNormal && !!item.purchaseConfirmedAt;
                  const matchedReview = reviewedDeliveryItems.find(
                    (r) => r.deliveryItemId === item.deliveryItemId
                  );
                  const canWriteReview = isConfirmed && !matchedReview;
                  const hasReviewed = isConfirmed && !!matchedReview;

                  return (
                    <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                      <OrderItemCard item={item} sellerName={order.sellerName} />
                      {returnStatusLabel && (
                        <div className="pb-3">
                          <span className={`text-xs font-medium ${returnStatusLabel.color}`}>
                            {returnStatusLabel.label}
                          </span>
                        </div>
                      )}
                      {item.purchaseConfirmedAt && (
                        <div className="pb-3">
                          <span className="text-xs text-green-600">
                            구매확정 완료 ({formatDate(item.purchaseConfirmedAt)})
                          </span>
                        </div>
                      )}
                      {(canRequestReturn ||
                        canConfirmPurchase ||
                        canWriteReview ||
                        hasReviewed) && (
                        <div className="flex items-center gap-2 pb-3">
                          {canRequestReturn && (
                            <ReturnRequestDialog deliveryItemId={item.deliveryItemId!} />
                          )}
                          {canConfirmPurchase && (
                            <ConfirmPurchaseButton deliveryItemId={item.deliveryItemId!} />
                          )}
                          {canWriteReview && (
                            <ReviewWriteButton
                              productId={item.productId!}
                              deliveryItemId={item.deliveryItemId!}
                              productName={item.productName}
                              mainImage={item.mainImage}
                              options={item.options}
                              salePrice={item.salePrice}
                            />
                          )}
                          {hasReviewed && (
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <Link to={`/myPage/reviews?reviewId=${matchedReview!.reviewId}`}>
                                내가 쓴 리뷰 보기
                              </Link>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {useBulkConfirm && (
                <div className="px-4 pb-3">
                  <BulkConfirmPurchaseButton deliveryItemIds={unconfirmedNormalItemIds} />
                </div>
              )}

              <div className="px-4 pb-3">
                <OrderTimeline order={order} />
              </div>
            </div>
          );
        })}
      </div>
    </Content>
  );
}
