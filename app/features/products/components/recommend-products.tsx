import { Link } from "react-router";
import { formatCurrency } from "~/lib/utils";
import type { ProductListItem } from "~/features/stores/queries";

interface RecommendProductsProps {
  products: ProductListItem[];
}

export default function RecommendProducts({ products }: RecommendProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="flex w-full px-4 flex-col items-start">
      <div className="flex w-full justify-between items-center">
        <div className="flex h-6 shrink-0">
          <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
            추천 상품
          </span>
        </div>
      </div>
      <div className="flex pt-1 flex-col items-start overflow-x-auto max-w-full overflow-y-hidden">
        <div className="flex items-center gap-0.5">
          {products.map((product) => (
            <RecommendProduct key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecommendProduct({ product }: { product: ProductListItem }) {
  return (
    <Link to={`/products/${product.productCode}`} prefetch="intent">
      <div className="flex w-27.5 flex-col items-center gap-0.25">
        <div className="flex w-full h-33.5 pb-0.25 flex-col justify-center items-center">
          {product.mainImage ? (
            <img
              src={product.mainImage}
              alt={product.name}
              className="h-33.5 w-full object-cover rounded-md"
            />
          ) : (
            <div className="h-33.5 w-full bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-xs text-muted">No Image</span>
            </div>
          )}
        </div>
        <div className="flex px-0.5 items-center self-stretch">
          <span className="text-[10px] font-bold leading-[140%] tracking-[-0.8px] flex-gsb line-clamp-1">
            {product.name}
          </span>
        </div>
        <div className="flex px-0.5 items-center gap-0.5 self-stretch">
          {product.discountRate > 0 && (
            <div className="flex justify-center items-center gap-2.5">
              <span className="text-sm font-bold leading-[100%] tracking-[-0.4px] text-accent">
                {product.discountRate}%
              </span>
            </div>
          )}
          <div className="flex justify-center items-center gap-2.5 flex-gsb">
            <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
              {formatCurrency(product.salePrice)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
