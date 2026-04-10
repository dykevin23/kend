import { Link } from "react-router";
import { productSample3 } from "~/assets/images";
import { Badge } from "~/common/components/ui/badge";
import { cn } from "~/lib/utils";

interface LikeProductCardProps {
  productId: string;
}

export default function LikeProductCard({ productId }: LikeProductCardProps) {
  return (
    <Link
      to={`/products/${productId}`}
      prefetch="intent"
      className="flex px-4 items-start gap-4 self-stretch"
    >
      <div className="flex pb-6 items-start gap-4 flex-gsb self-stretch border-b-1 border-b-muted/30">
        <div className="size-28">
          <img src={productSample3} className="rounded-md" />
        </div>

        <div className="flex h-30 justify-between items-start flex-gsb">
          <div className="flex h-28 flex-col items-start gap-2 flex-gsb">
            <div className="flex w-33 px-2.5 flex-col items-start gap-2">
              <span className="text-ellipsis text-base leading-[140%]">
                스토케 트립트랩
              </span>
            </div>
            <div className="flex w-31 h-4 px-2.5 justify-between items-center shrink-0">
              <div className="flex w-8 h-4 px-2 justify-center items-center gap-2.5 shrink-0">
                <span className="text-center text-sm font-bold leading-[100%] tracking-[-0.4px] text-accent">
                  42%
                </span>
              </div>

              <div className="flex w-14.5 h-4 justify-center items-center gap-2.5 shrink-0">
                <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
                  22,000
                </span>
              </div>
            </div>
            <div className="flex h-3.5 px-2.5 items-center gap-1 shrink-0">
              <Badge>무료배송</Badge>
              <Badge>첫구매쿠폰</Badge>
            </div>
            <div className="flex h-3.5 px-2.5 items-start gap-1 shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
              >
                <path
                  d="M4.29467 3.0084C4.5622 2.34145 4.69596 2.00797 4.91329 1.96175C4.97043 1.9496 5.02949 1.9496 5.08663 1.96175C5.30396 2.00797 5.43772 2.34145 5.70525 3.0084C5.85739 3.38768 5.93346 3.57732 6.0758 3.70631C6.11573 3.74249 6.15907 3.77471 6.20521 3.80252C6.36973 3.90168 6.5751 3.92007 6.98584 3.95686C7.68116 4.01913 8.02882 4.05026 8.13498 4.24849C8.15697 4.28955 8.17192 4.334 8.17921 4.37999C8.21441 4.60209 7.95883 4.83461 7.44767 5.29966L7.30572 5.4288C7.06674 5.64622 6.94725 5.75493 6.87814 5.8906C6.83668 5.97198 6.80888 6.05963 6.79586 6.15003C6.77414 6.30073 6.80913 6.45844 6.87911 6.77385L6.90412 6.88654C7.02962 7.45218 7.09237 7.735 7.01403 7.87401C6.94367 7.99888 6.81407 8.07883 6.67091 8.08566C6.51152 8.09328 6.28694 7.91028 5.83779 7.54428C5.54187 7.30315 5.39391 7.18258 5.22965 7.13548C5.07955 7.09244 4.92037 7.09244 4.77027 7.13548C4.60601 7.18258 4.45805 7.30315 4.16213 7.54428C3.71298 7.91028 3.4884 8.09328 3.32901 8.08566C3.18585 8.07883 3.05625 7.99888 2.98589 7.87401C2.90755 7.735 2.9703 7.45218 3.0958 6.88654L3.12081 6.77385C3.19079 6.45844 3.22578 6.30073 3.20406 6.15003C3.19104 6.05963 3.16324 5.97198 3.12178 5.8906C3.05267 5.75493 2.93318 5.64622 2.6942 5.42881L2.55225 5.29966C2.04109 4.83461 1.78551 4.60209 1.82071 4.37999C1.828 4.334 1.84295 4.28955 1.86494 4.24849C1.9711 4.05026 2.31876 4.01913 3.01408 3.95686C3.42482 3.92007 3.63019 3.90168 3.79471 3.80252C3.84085 3.77471 3.88419 3.74249 3.92412 3.70631C4.06646 3.57732 4.14253 3.38768 4.29467 3.0084Z"
                  fill="#EBABF8"
                />
              </svg>
              <span className="text-[10px] leading-[100%] tracking-[-0.4px]">
                4.6 (4,321)
              </span>
            </div>
            <div className="flex h-3.5 px-2.5 items-start gap-1 shrink-0">
              <Badge
                variant="secondary"
                className={cn(
                  "flex h-3.5 px-2 justify-center items-center gap-2.5",
                  "text-center text-[10px] leading-[100%] tracking-[-0.4px] font-normal"
                )}
              >
                추천 SIZE : 12 M
              </Badge>
            </div>
          </div>

          <div className="flex w-16 h-29.5 flex-col justify-center items-center gap-2">
            <div className="size-16 shrink-0 self-stretch aspect-square rounded-full bg-muted/30"></div>
            <div className="flex w-16 h-12 flex-col justify-between items-center shrink-0">
              <Badge>Kend Kid</Badge>
              <div className="flex items-center gap-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M11.0767 2.3335C9.76921 2.3335 8.62754 3.12183 8.00004 4.15183C7.37254 3.12183 6.23087 2.3335 4.92337 2.3335C2.94004 2.3335 1.33337 3.916 1.33337 5.8685C1.33337 6.846 1.72337 7.74016 2.35921 8.39433C3.80254 9.8785 8.00004 14.0002 8.00004 14.0002C8.00004 14.0002 12.1975 9.8785 13.6409 8.39433C14.2991 7.71838 14.6672 6.812 14.6667 5.8685C14.6667 3.916 13.06 2.3335 11.0767 2.3335Z"
                    fill="#FF9020"
                  />
                </svg>
                <span className="text-xs leading-[100%] text-accent">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
