import { Link } from "react-router";
import { productSample3 } from "~/assets/images";

export default function RecommendProducts() {
  return (
    <div className="flex pt-4 flex-col items-start gap-1">
      <div className="flex w-full px-4 flex-col items-start">
        <div className="flex w-full justify-between items-center">
          <div className="flex w-27 h-6 shrink-0">
            <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
              성장 Data 추천
            </span>
          </div>
          <div className="flex w-40 h-6 shrink-0">
            <span className="text-[10px] text-right leading-[120%] text-muted/30">
              |신장: 85cm |발사이즈: 14cm |머리 둘레: 48cm |체중: 13kg
            </span>
          </div>
        </div>
        <div className="flex pt-1 flex-col items-start overflow-x-auto max-w-full overflow-y-hidden">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 10 }).map(() => (
              <RecommendProduct />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const RecommendProduct = () => {
  return (
    <Link to="/products/product-1">
      <div className="flex w-27.5 flex-col items-center gap-0.25">
        <div className="flex w-full h-33.5 pb-0.25 flex-col justify-center items-center">
          <img src={productSample3} className="h-33.5" />
        </div>
        <div className="flex px-0.5 items-center self-stretch">
          <span className="text-[10px] font-bold leading-[140%] tracking-[-0.8px] flex-gsb">
            코유코유
          </span>
        </div>
        <div className="flex px-0.5 items-center self-stretch">
          <span className="text-[10px] font-bold leading-[140%] tracking-[-0.8px] flex-gsb">
            꽈베기 상하의 빨리빨리...
          </span>
        </div>
        <div className="flex px-0.5 items-center gap-0.5 self-stretch">
          <div className="flex justify-center items-center gap-2.5">
            <span className="text-sm font-bold leading-[100%] tracking-[-0.4px] text-accent">
              42%
            </span>
          </div>
          <div className="flex justify-center items-center gap-2.5 flex-gsb">
            <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
              22,000
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
