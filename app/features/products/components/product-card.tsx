import { Link } from "react-router";
import type { ProductListItem } from "~/features/stores/queries";

interface ProductCardProps {
  product: ProductListItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = product.salePrice.toLocaleString();

  return (
    <Link
      to={`/products/${product.productCode}`}
      prefetch="intent"
      className="flex w-full flex-col items-start gap-1.5 shrink-0"
    >
      {/* 상품 이미지 */}
      {product.mainImage ? (
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full aspect-square shrink-0 object-cover border border-muted/20"
        />
      ) : (
        <div className="w-full aspect-square shrink-0 bg-gray-300 flex items-center justify-center border border-muted/20">
          <span className="text-xs text-muted">No Image</span>
        </div>
      )}

      {/* 상품명 - 왼쪽 정렬, 최대 2줄, 고정 높이 */}
      <span className="w-full px-0.5 text-xs leading-4 tracking-[-0.4px] line-clamp-2 min-h-8">
        {product.name}
      </span>

      {/* 할인율(좌측) + 가격(우측) */}
      <div className="flex w-full px-0.5 items-center justify-between">
        {product.discountRate > 0 ? (
          <span className="text-sm font-bold leading-4 tracking-[-0.4px] text-accent">
            {product.discountRate}%
          </span>
        ) : (
          <span />
        )}
        <span className="text-sm font-bold leading-4 tracking-[-0.4px]">
          {formattedPrice}
        </span>
      </div>
    </Link>
  );
}
