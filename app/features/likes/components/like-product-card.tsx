import { Link } from "react-router";
import { formatCurrency } from "~/lib/utils";
import type { LikedProduct } from "../queries";

interface LikeProductCardProps {
  item: Pick<LikedProduct, "product" | "seller">;
}

export default function LikeProductCard({ item }: LikeProductCardProps) {
  const { product, seller } = item;

  return (
    <Link
      to={`/products/${product.productCode}`}
      prefetch="intent"
      className="flex w-full gap-3.5 px-5 py-4 border-b border-gray-100"
    >
      {product.mainImage ? (
        <img
          src={product.mainImage}
          alt={product.name}
          className="size-20 shrink-0 rounded-thumb object-cover bg-gray-100"
        />
      ) : (
        <div className="size-20 shrink-0 rounded-thumb bg-gray-100 flex items-center justify-center">
          <span className="text-xs text-gray-400">No Image</span>
        </div>
      )}

      <div className="flex flex-1 min-w-0 flex-col gap-[5px]">
        {seller && (
          <span className="text-xs font-semibold text-gray-500 truncate">
            {seller.name}
          </span>
        )}
        <span className="text-[13.5px] font-semibold leading-[1.4] text-gray-900 line-clamp-2">
          {product.name}
        </span>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          {product.discountRate > 0 && (
            <span className="text-[13px] font-extrabold text-orange-600">
              {product.discountRate}%
            </span>
          )}
          <span className="text-[14.5px] font-extrabold text-gray-900">
            {formatCurrency(product.salePrice)}원
          </span>
        </div>
      </div>
    </Link>
  );
}
