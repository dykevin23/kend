import { useEffect } from "react";
import { redirect, useFetcher, useLoaderData } from "react-router";
import { DateTime } from "luxon";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import { useAlert } from "~/hooks/useAlert";
import { makeSSRClient } from "~/supa-client";
import { getOrderGroupDetail } from "../queries";
import OrderItemCard from "../components/order-item-card";
import ReturnRequestDialog from "../components/return-request-dialog";
import { getReturnStatusLabel } from "../utils";
import type { Route } from "./+types/order-detail-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw redirect("/auth/login");
  }

  const orderGroup = await getOrderGroupDetail(client, params.orderGroupId, user.id);

  return { orderGroup };
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
    { label: "구매확정", at: order.purchaseConfirmedAt },
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
  const { orderGroup } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { alert } = useAlert();

  useEffect(() => {
    if (fetcher.data && fetcher.data.success === false) {
      alert({
        title: "구매확정 실패",
        message: fetcher.data.error ?? "구매확정 처리에 실패했어요.",
        primaryButton: { label: "확인" },
      });
    }
  }, [fetcher.data]);

  const handleConfirmPurchase = (orderId: string) => {
    const formData = new FormData();
    formData.append("intent", "confirmPurchase");
    formData.append("orderId", orderId);
    fetcher.submit(formData, { method: "POST", action: "/orders/action" });
  };

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
          const hasPendingReturnOrExchange = order.items.some(
            (item) =>
              item.deliveryItemStatus === "return_requested" ||
              item.deliveryItemStatus === "exchange_requested"
          );
          const canConfirmPurchase =
            order.status === "delivered" &&
            !order.purchaseConfirmedAt &&
            !hasPendingReturnOrExchange;

          return (
            <div key={order.id} className="flex flex-col bg-white border-b border-gray-100 mt-2">
              <div className="px-4 pt-4 pb-2">
                <span className="text-sm font-bold">{order.sellerName}</span>
              </div>

              <div className="px-4">
                {order.items.map((item) => {
                  const canRequestReturn =
                    order.status === "delivered" &&
                    !order.purchaseConfirmedAt &&
                    item.deliveryItemId &&
                    item.deliveryItemStatus === "normal";
                  const returnStatusLabel = getReturnStatusLabel(item);

                  return (
                    <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                      <OrderItemCard item={item} sellerName={order.sellerName} />
                      {canRequestReturn && (
                        <div className="pb-3">
                          <ReturnRequestDialog deliveryItemId={item.deliveryItemId!} />
                        </div>
                      )}
                      {returnStatusLabel && (
                        <div className="pb-3">
                          <span className={`text-xs font-medium ${returnStatusLabel.color}`}>
                            {returnStatusLabel.label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="px-4 pb-3">
                <OrderTimeline order={order} />
              </div>

              {canConfirmPurchase && (
                <div className="px-4 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={fetcher.state !== "idle"}
                    onClick={() => handleConfirmPurchase(order.id)}
                  >
                    {fetcher.state !== "idle" ? "처리 중..." : "구매확정"}
                  </Button>
                </div>
              )}
              {order.purchaseConfirmedAt && (
                <div className="px-4 pb-4">
                  <span className="text-xs text-green-600">
                    구매확정 완료 ({formatDate(order.purchaseConfirmedAt)})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Content>
  );
}
