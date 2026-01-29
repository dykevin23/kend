import { DateTime } from "luxon";
import type { UserOrderGroup, UserOrder } from "../queries";
import OrderItemCard from "./order-item-card";
import { Button } from "~/common/components/ui/button";

interface OrderGroupCardProps {
  orderGroup: UserOrderGroup;
}

/**
 * 개별 주문(판매자별) 상태 라벨
 */
function getOrderStatusLabel(status: string): { label: string; color: string } {
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

/**
 * 개별 주문 블록 (판매자별)
 * - 상태 + 아이템들 + 액션 버튼
 */
function OrderBlock({ order }: { order: UserOrder }) {
  const status = getOrderStatusLabel(order.status);

  return (
    <div>
      {/* 주문 상태 */}
      <div className="px-4 pt-4 pb-2">
        <span className={`text-sm font-bold ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* 상품 목록 */}
      <div className="px-4">
        {order.items.map((item) => (
          <OrderItemCard key={item.id} item={item} sellerName={order.sellerName} />
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          배송·주문 관리
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          배송 조회
        </Button>
      </div>
    </div>
  );
}

/**
 * 주문 그룹 카드
 * - order_group 단위로 하나의 카드
 * - 하위 orders(판매자별)는 붙여서 표시
 */
export default function OrderGroupCard({ orderGroup }: OrderGroupCardProps) {
  const orderDate = DateTime.fromISO(orderGroup.createdAt).toFormat(
    "yyyy. M. d"
  );

  return (
    <div className="bg-white">
      {/* 헤더: 날짜 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-base font-bold text-gray-900">{orderDate}</span>
      </div>

      {/* 주문별 블록 (판매자별) - 붙여서 표시 */}
      {orderGroup.orders.map((order) => (
        <OrderBlock key={order.id} order={order} />
      ))}
    </div>
  );
}
