import { ArrowLeft, Search, ShoppingBag } from "lucide-react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { Input } from "~/common/components/ui/input";
import RecommendProducts from "~/features/products/components/recommend-products";
import { makeSSRClient } from "~/supa-client";
import { getRandomProducts } from "~/features/products/queries";
import type { Route } from "./+types/search-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const recommendProducts = await getRandomProducts(client, 10);
  return { recommendProducts };
};

const searchs = [
  ["우주복", "여름옷", "내복", "반팔", "후드티"],
  ["신생아", "양말", "손싸개", "봄옷", "청바지"],
];

export default function SearchPage() {
  const { recommendProducts } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex p-4 items-center gap-2.5 self-stretch">
        <ArrowLeft size={28} onClick={() => navigate(-1)} />
        <div className="flex flex-1 py-2 px-4 items-center rounded-xl bg-muted/10">
          <Input
            className="flex-1 h-3.5 border-0 text-left text-xs font-bold leading-3.5"
            placeholder="검색어를 입력해주세요."
          />
          <Search className="size-3.5 shrink-0" />
        </div>
        <Link to="/carts">
          <ShoppingBag className="size-7" />
        </Link>
      </div>

      <div className="flex w-full py-4 flex-col items-start gap-6">
        <RecommendProducts products={recommendProducts} />
        <div className="flex w-full px-4 flex-col items-start">
          <div className="flex w-full items-center">
            <div className="flex w-full h-6 flex-col justify-center shrink-0">
              <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
                급상승 검색어
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 w-full px-2.5 py-4 gap-y-2.5 gap-x-4">
            {searchs[0].map((left, i) => {
              const right = searchs[1][i];
              return [
                { label: left, num: i + 1 },
                { label: right, num: i + 6 },
              ];
            }).flat().map(({ label, num }) => (
              <div key={num} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-right text-xs font-bold leading-[100%] tracking-[-0.4px]">
                  {num}
                </span>
                <span className="flex-1 text-xs leading-[100%] tracking-[-0.4px]">
                  {label}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                  <path d="M3 7.5L6 4.5L9 7.5" stroke="#FF0000" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
