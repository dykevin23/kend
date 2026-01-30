import { Link } from "react-router";
import type { UserOrderItem } from "../queries";

interface OrderItemCardProps {
  item: UserOrderItem;
  sellerName: string;
}

/**
 * 주문 아이템 카드
 * 대표이미지, 판매자, 상품명, 옵션, 가격을 표시
 */
export default function OrderItemCard({ item, sellerName }: OrderItemCardProps) {
  // 옵션 문자열 생성
  const optionString = item.options
    ? Object.values(item.options).join(" / ")
    : null;

  return (
    <div className="flex gap-3 py-3">
      {/* 대표 이미지 */}
      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
        {item.mainImage ? (
          <img
            src={item.mainImage}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* 판매자명 */}
        <span className="text-xs text-gray-500 mb-0.5">{sellerName}</span>

        {/* 상품명 */}
        <span className="text-sm font-medium text-gray-900 line-clamp-2">
          {item.productName}
        </span>

        {/* 옵션 정보 */}
        {optionString && (
          <span className="text-xs text-gray-500 mt-0.5">{optionString}</span>
        )}

        {/* 가격 및 수량 */}
        <div className="flex items-center gap-1 mt-auto pt-1">
          <span className="text-sm font-semibold text-gray-900">
            {item.salePrice.toLocaleString()}원
          </span>
          <span className="text-xs text-gray-500">/ {item.quantity}개</span>
        </div>
      </div>
    </div>
  );
}
