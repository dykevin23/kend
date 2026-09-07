import { forwardRef } from "react";
import StarRating from "~/common/components/star-rating";

interface ProductRatingSectionProps {
  averageRating: number;
  totalReviews: number;
}

const ProductRatingSection = forwardRef<HTMLDivElement, ProductRatingSectionProps>(
  ({ averageRating, totalReviews }, ref) => {
    if (totalReviews === 0) {
      return null;
    }

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
      </div>
    );
  }
);

ProductRatingSection.displayName = "ProductRatingSection";

export default ProductRatingSection;
