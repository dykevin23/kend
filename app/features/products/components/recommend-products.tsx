import { useEffect, useState } from "react";
import { Link } from "react-router";
import { formatCurrency } from "~/lib/utils";
import { browserClient } from "~/supa-client";
import {
  getRandomProducts,
  type RandomProduct,
} from "~/features/products/queries";

interface RecommendProductsProps {
  excludeIds?: Array<string | number>;
  limit?: number;
}

// 라우팅/리페치 시 추천 목록이 흔들리지 않도록 모듈 스코프 캐시로 1회만 로드
let cachedRecommends: RandomProduct[] | null = null;
let cachePromise: Promise<RandomProduct[]> | null = null;

export default function RecommendProducts({
  excludeIds = [],
  limit = 10,
}: RecommendProductsProps) {
  const [products, setProducts] = useState<RandomProduct[]>(
    cachedRecommends ?? []
  );

  useEffect(() => {
    if (cachedRecommends) {
      setProducts(cachedRecommends);
      return;
    }
    if (!cachePromise) {
      cachePromise = getRandomProducts(browserClient, 20)
        .then((data) => {
          cachedRecommends = data;
          return data;
        })
        .catch((error) => {
          cachePromise = null;
          throw error;
        });
    }
    let cancelled = false;
    cachePromise.then((data) => {
      if (!cancelled) setProducts(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const excludeSet = new Set(excludeIds.map((id) => String(id)));
  const filtered = products
    .filter((p) => !excludeSet.has(String(p.id)))
    .slice(0, limit);

  if (filtered.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-3.5 px-5 pt-5 pb-3">
      <span className="text-[15px] font-extrabold text-gray-900">
        이런 상품은 어때요
      </span>
      <div className="flex gap-2.5 overflow-x-auto">
        {filtered.map((product) => (
          <RecommendProduct key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function RecommendProduct({ product }: { product: RandomProduct }) {
  return (
    <Link
      to={`/products/${product.productCode}`}
      prefetch="intent"
      className="flex w-28 shrink-0 flex-col gap-1.5"
    >
      {product.mainImage ? (
        <img
          src={product.mainImage}
          alt={product.name}
          className="size-28 object-cover rounded-[14px] bg-gray-100"
        />
      ) : (
        <div className="size-28 bg-gray-100 rounded-[14px] flex items-center justify-center">
          <span className="text-xs text-gray-400">No Image</span>
        </div>
      )}
      <span className="text-xs font-semibold text-gray-900 line-clamp-1">
        {product.name}
      </span>
      <div className="flex items-baseline gap-1">
        {product.discountRate > 0 && (
          <span className="text-xs font-extrabold text-orange-600">
            {product.discountRate}%
          </span>
        )}
        <span className="text-[12.5px] font-extrabold text-gray-900">
          {formatCurrency(product.salePrice)}원
        </span>
      </div>
    </Link>
  );
}
