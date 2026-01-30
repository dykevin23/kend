import { ArrowLeft, Search, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Input } from "~/common/components/ui/input";
import RecommendProducts from "~/features/products/components/recommend-products";

export default function SearchPage() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex p-4 items-center gap-2.5 self-stretch">
        <ArrowLeft size={28} onClick={() => navigate(-1)} />
        <div className="flex py-2 px-4 items-center flex-gsb rounded-xl bg-muted/10">
          <div className="flex w-56 h-3.5 items-center">
            <Input
              className="h-3.5 border-0 text-left text-xs font-bold leading-3.5 "
              placeholder="검색어를 입력해주세요."
            />
          </div>
          <Search className="size-3.5 aspect-square" />
        </div>
        <Link to="/carts">
          <ShoppingBag className="size-7" />
        </Link>
      </div>

      <div className="flex h-94 py-4 flex-col items-start gap-1 shrink-0">
        <RecommendProducts />
        <div className="flex px-4 flex-col items-start shrink-0">
          <div className="flex w-full items-center">
            <div className="flex w-full h-6 flex-col justify-center shrink-0">
              <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
                급상승 검색어
              </span>
            </div>
          </div>
          <div className="flex px-2.5 items-center gap-1 shrink-0 self-stretch">
            <div className="flex w-40 py-4 flex-col justify-center items-start gap-2.5">
              {Array.from({ length: 5 }).map((_, index) => {
                return (
                  <div className="flex w-40 items-center gap-5">
                    <div className="w-5 shrink-0">
                      <span className="text-right text-xs font-bold leading-[100%] tracking-[-0.4px]">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-xs leading-[100%] tracking-[-0.4px]">
                      키득키득
                    </span>
                    <div className="flex justify-end items-center gap-5 flex-gsb">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path d="M3 7.5L6 4.5L9 7.5" stroke="#FF0000" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex w-40 py-4 flex-col justify-center items-start gap-2.5">
              {Array.from({ length: 5 }).map((_, index) => {
                return (
                  <div className="flex w-40 items-center gap-5">
                    <div className="w-5 shrink-0">
                      <span className="text-right text-xs font-bold leading-[100%] tracking-[-0.4px]">
                        {index + 6}
                      </span>
                    </div>
                    <span className="text-xs leading-[100%] tracking-[-0.4px]">
                      키득키득
                    </span>
                    <div className="flex justify-end items-center gap-5 flex-gsb">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path d="M3 7.5L6 4.5L9 7.5" stroke="#FF0000" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
