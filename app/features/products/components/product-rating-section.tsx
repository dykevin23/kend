import { forwardRef } from "react";
import StarRating from "~/common/components/star-rating";

interface RatingStatItem {
  label: string;
  value: string;
  percentage: number;
}

interface ProductRatingSectionProps {
  averageRating?: number;
  totalReviews?: number;
  ratingStats?: RatingStatItem[];
}

const ProductRatingSection = forwardRef<
  HTMLDivElement,
  ProductRatingSectionProps
>(
  (
    {
      averageRating = 4.5,
      totalReviews = 4321,
      ratingStats = [
        { label: "색감", value: "사진 보다 진해요", percentage: 64 },
        { label: "사이즈", value: "정사이즈에요", percentage: 72 },
        { label: "두께감", value: "적당해요", percentage: 58 },
      ],
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="flex p-2.5 flex-col items-start gap-2.5 self-stretch"
      >
        <div className="flex px-2.5 justify-center items-center gap-2.5 self-stretch">
          <StarRating score={Math.round(averageRating)} />
          <div className="text-xl font-bold leading-[100%] tracking-[-0.4px]">
            <span>{averageRating}</span>
            <span className="text-muted"> / 5</span>
          </div>
          <span className="text-sm laeding-[100%] tracking-[-0.4px] text-muted">
            ({totalReviews.toLocaleString()})
          </span>
        </div>

        {ratingStats.map((stat, index) => (
          <div
            key={index}
            className="flex py-2 pr-2.5 pl-1 items-center gap-9 self-stretch border-1 border-muted-foreground/10"
          >
            <div className="flex h-4.5 flex-col items-start">
              <div className="flex w-19 h-4.5 flex-col justify-center shrink-0">
                <span className="text-sm font-bold leading-[100%] tracking-[-0.4px] text-muted">
                  {stat.label}
                </span>
              </div>
            </div>
            <div className="flex h-4.5 flex-col justify-center items-center">
              <span className="text-xs font-bold leading-[100%] tracking-[-0.4px]">
                {stat.value}
              </span>
            </div>
            <div className="flex h-4.5 flex-col items-start flex-gsb">
              <div className="flex h-4.5 flex-col justify-center shrink-0 self-stretch">
                <span className="text-right text-base font-bold leading-[100%] tracking-[-0.4px] text-accent">
                  {stat.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

ProductRatingSection.displayName = "ProductRatingSection";

export default ProductRatingSection;
