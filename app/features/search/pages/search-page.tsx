import { ChevronLeft, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router";
import CartIcon from "~/common/components/cart-icon";
import ProductCard from "~/features/products/components/product-card";
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
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 flex items-center gap-1.5 px-3.5 py-3 bg-white border-b border-gray-100">
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center text-gray-900"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-[22px]" strokeWidth={2} />
        </button>
        <Form
          method="get"
          action="/search"
          replace
          className="flex flex-1 h-[42px] px-3.5 items-center gap-2 rounded-full bg-gray-50"
        >
          <button type="submit" className="shrink-0 text-gray-500" aria-label="검색">
            <Search className="size-[18px]" strokeWidth={1.8} />
          </button>
          <Input
            name="q"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 h-auto p-0 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13.5px] text-gray-900 placeholder:text-gray-500"
            placeholder="상품명을 검색해 보세요"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="shrink-0 text-gray-400"
              aria-label="검색어 지우기"
            >
              <X className="size-4" />
            </button>
          )}
        </Form>
        <CartIcon className="size-9 [&_svg]:size-[21px]" />
      </div>

      {hasQuery ? (
        <div className="flex w-full flex-col gap-4 pt-[18px]">
          <span className="px-5 text-[15px] font-extrabold text-gray-900">
            "{q}" 검색 결과{" "}
            <span className="text-primary">{results.length}</span>건
          </span>
          {results.length === 0 ? (
            <div className="flex w-full py-10 justify-center items-center">
              <span className="text-sm text-gray-500">검색 결과가 없습니다.</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-2.5 gap-y-4 px-5">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <RecommendProducts excludeIds={excludeIds} title="추천 상품" />
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2 pt-1">
          <RecommendProducts title="추천 상품" />
          <div className="flex w-full flex-col px-5 pb-6">
            <span className="mb-1.5 text-[15px] font-extrabold text-gray-900">
              급상승 검색어
            </span>
            <div className="grid grid-cols-2 gap-x-5">
              {searchs.map((column, col) => (
                <div key={col}>
                  {column.map((label, i) => {
                    const num = col * column.length + i + 1;
                    return (
                      <Link
                        key={num}
                        to={`/search?q=${encodeURIComponent(label)}`}
                        replace
                        className="flex items-center gap-[9px] py-[9px]"
                      >
                        <span className="w-4 shrink-0 text-sm font-extrabold text-primary">
                          {num}
                        </span>
                        <span className="flex-1 text-[13.5px] text-gray-900 truncate">
                          {label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
