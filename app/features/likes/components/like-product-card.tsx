import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils";
import type { LikedProduct } from "../queries";

interface LikeProductCardProps {
  item: LikedProduct;
}

export default function LikeProductCard({ item }: LikeProductCardProps) {
  const { product, seller } = item;

  return (
    <Link
      to={`/products/${product.productCode}`}
      prefetch="intent"
      className="flex px-4 items-start gap-4 self-stretch"
    >
      <div className="flex pb-6 items-start gap-4 flex-gsb self-stretch border-b-1 border-b-muted/30">
        <div className="size-28 shrink-0">
          {product.mainImage ? (
            <img
              src={product.mainImage}
              alt={product.name}
              className="size-28 rounded-md object-cover"
            />
          ) : (
            <div className="size-28 rounded-md bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-muted">No Image</span>
            </div>
          )}
        </div>

        <div className="flex h-30 justify-between items-start flex-gsb">
          <div className="flex h-28 flex-col items-start gap-2 flex-gsb">
            <div className="flex w-33 px-2.5 flex-col items-start gap-2">
              <span className="text-ellipsis text-base leading-[140%] line-clamp-1">
                {product.name}
              </span>
            </div>
            <div className="flex w-31 h-4 px-2.5 justify-between items-center shrink-0">
              {product.discountRate > 0 && (
                <div className="flex w-8 h-4 px-2 justify-center items-center gap-2.5 shrink-0">
                  <span className="text-center text-sm font-bold leading-[100%] tracking-[-0.4px] text-accent">
                    {product.discountRate}%
                  </span>
                </div>
              )}
              <div className="flex h-4 justify-center items-center gap-2.5 shrink-0">
                <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
                  {formatCurrency(product.salePrice)}
                </span>
              </div>
            </div>
            {seller && (
              <div className="flex h-3.5 px-2.5 items-start gap-1 shrink-0">
                <Badge
                  variant="secondary"
                  className={cn(
                    "flex h-3.5 px-2 justify-center items-center gap-2.5",
                    "text-center text-[10px] leading-[100%] tracking-[-0.4px] font-normal"
                  )}
                >
                  {seller.name}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
