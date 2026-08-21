import { Link } from "react-router";
import { DateTime } from "luxon";
import type { UserOrderCard } from "../queries";
import OrderItemCard from "./order-item-card";
import { Button } from "~/common/components/ui/button";
import { getItemStatusLabel } from "../utils";

interface OrderStatusCardProps {
  card: UserOrderCard;
}

/**
 * 배송중/배송완료/취소·환불 탭 전용 카드
 *
 * order_group이 아니라 orders(판매자) 단위로 렌더링하고, 상품도 해당 탭에
 * 맞는 것만 표시한다(반품 진행중인 상품은 배송완료 탭에서 빠지고 취소/환불
 * 탭에만 나오는 식) — P2.5-3 실사용 테스트 중 발견된 이슈 수정.
 */
export default function OrderStatusCard({ card }: OrderStatusCardProps) {
  const orderDate = DateTime.fromISO(card.orderGroupCreatedAt).toFormat(
    "yyyy. M. d"
  );

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

      <div className="px-4 py-3">
        <Button variant="outline" size="sm" className="w-full text-xs" asChild>
          <Link to={`/orders/${card.orderGroupId}`}>배송·주문 관리</Link>
        </Button>
      </div>
    </div>
  );
}
