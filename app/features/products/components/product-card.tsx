import { Link } from "react-router";
import type { ProductListItem } from "~/features/stores/queries";

interface ProductCardProps {
  // 스토어 상품 목록·검색 결과 등 여러 쿼리 결과를 그대로 받을 수 있게 필요한 필드만 요구
  product: Pick<
    ProductListItem,
    "productCode" | "mainImage" | "name" | "salePrice" | "discountRate"
  >;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = product.salePrice.toLocaleString();

  return (
    <Link
      to={`/products/${product.productCode}`}
      prefetch="intent"
      className="flex w-full flex-col items-start gap-[7px] shrink-0"
    >
      {/* 상품 이미지 — 보더 대신 은은한 그림자 */}
      {product.mainImage ? (
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full aspect-square shrink-0 object-cover rounded-[14px] shadow-[0_4px_10px_rgba(15,33,56,0.08)]"
        />
      ) : (
        <div className="w-full aspect-square shrink-0 rounded-[14px] bg-gray-100 flex items-center justify-center">
          <span className="text-xs text-gray-400">No Image</span>
        </div>
      )}

      {/* 상품명 - 최대 2줄, 고정 높이 */}
      <span className="w-full text-[12.5px] font-medium leading-[1.35] text-gray-900 line-clamp-2 min-h-[34px]">
        {product.name}
      </span>

      {/* 할인율 + 가격 */}
      <div className="flex w-full items-baseline gap-1">
        {product.discountRate > 0 && (
          <span className="text-xs font-extrabold text-orange-600">
            {product.discountRate}%
          </span>
        )}
        <span className="text-[13px] font-extrabold text-gray-900">
          {formattedPrice}원
        </span>
      </div>
    </Link>
  );
}
