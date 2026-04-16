import { ArrowLeft, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router";
import { formatCurrency } from "~/lib/utils";
import { Input } from "~/common/components/ui/input";
import RecommendProducts from "~/features/products/components/recommend-products";
import { makeSSRClient } from "~/supa-client";
import { searchProductsByName } from "~/features/search/queries";
import type { Route } from "./+types/search-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const { client } = makeSSRClient(request);
  const results = q ? await searchProductsByName(client, q) : [];
  return { q, results };
};

const searchs = [
  ["우주복", "여름옷", "내복", "반팔", "후드티"],
  ["신생아", "양말", "손싸개", "봄옷", "청바지"],
];

export default function SearchPage() {
  const { q, results } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(q);

  useEffect(() => {
    setKeyword(searchParams.get("q") ?? "");
  }, [searchParams]);

  const hasQuery = q.length > 0;
  const excludeIds = results.map((p) => p.id);

  return (
    <div>
      <div className="flex p-4 items-center gap-2.5 self-stretch">
        <ArrowLeft size={28} onClick={() => navigate(-1)} />
        <Form
          method="get"
          action="/search"
          className="flex flex-1 py-2.5 px-4 items-center gap-2 rounded-xl bg-muted/10"
        >
          <Input
            name="q"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 border-0 shadow-none focus-visible:ring-0 text-left text-xs font-bold leading-4 p-0 h-auto"
            placeholder="검색어를 입력해주세요."
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="shrink-0"
            >
              <X className="size-4 text-muted" />
            </button>
          )}
          <button type="submit" className="shrink-0">
            <Search className="size-4" />
          </button>
        </Form>
        <Link to="/carts">
          <ShoppingBag className="size-7" />
        </Link>
      </div>

      {hasQuery ? (
        <div className="flex w-full flex-col gap-4 py-2">
          <div className="px-4">
            <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
              "{q}" 검색 결과 {results.length}건
            </span>
          </div>
          {results.length === 0 ? (
            <div className="flex w-full py-10 justify-center items-center">
              <span className="text-muted text-sm">
                검색 결과가 없습니다.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4">
              {results.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.productCode}`}
                  prefetch="intent"
                  className="flex flex-col items-start gap-1"
                >
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-muted">No Image</span>
                    </div>
                  )}
                  <span className="text-xs font-bold leading-[140%] tracking-[-0.4px] line-clamp-2">
                    {product.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {product.discountRate > 0 && (
                      <span className="text-sm font-bold leading-[100%] tracking-[-0.4px] text-accent">
                        {product.discountRate}%
                      </span>
                    )}
                    <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
                      {formatCurrency(product.salePrice)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="pt-4">
            <RecommendProducts excludeIds={excludeIds} />
          </div>
        </div>
      ) : (
        <div className="flex w-full py-4 flex-col items-start gap-6">
          <RecommendProducts />
          <div className="flex w-full px-4 flex-col items-start">
            <div className="flex w-full items-center">
              <div className="flex w-full h-6 flex-col justify-center shrink-0">
                <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
                  급상승 검색어
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 w-full px-2.5 py-4 gap-y-2.5 gap-x-4">
              {searchs[0]
                .map((left, i) => {
                  const right = searchs[1][i];
                  return [
                    { label: left, num: i + 1 },
                    { label: right, num: i + 6 },
                  ];
                })
                .flat()
                .map(({ label, num }) => (
                  <Link
                    key={num}
                    to={`/search?q=${encodeURIComponent(label)}`}
                    className="flex items-center gap-3"
                  >
                    <span className="w-5 shrink-0 text-right text-xs font-bold leading-[100%] tracking-[-0.4px]">
                      {num}
                    </span>
                    <span className="flex-1 text-xs leading-[100%] tracking-[-0.4px]">
                      {label}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="shrink-0"
                    >
                      <path d="M3 7.5L6 4.5L9 7.5" stroke="#FF0000" />
                    </svg>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
