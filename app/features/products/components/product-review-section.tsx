import { forwardRef } from "react";
import { DateTime } from "luxon";
import ProductReviewCard from "./product-review-card";
import type { ProductReview } from "~/features/reviews/queries";

interface ProductReviewSectionProps {
  reviews: ProductReview[];
}

const ProductReviewSection = forwardRef<HTMLDivElement, ProductReviewSectionProps>(
  ({ reviews }, ref) => {
    return (
      <div ref={ref} className="flex w-full p-4 flex-col items-start gap-2.5">
        <div className="flex p-4 items-center gap-2 self-stretch border-b-1 border-b-muted-foreground/10">
          <div className="flex items-center gap-1 flex-gsb">
            <span className="text-lg font-bold leading-[100%] tracking-[-0.4px]">
              리뷰
            </span>
            <span className="text-base leading-[100%] tracking-[-0.4px] text-muted/50">
              ({reviews.length.toLocaleString()})
            </span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="flex w-full py-10 justify-center items-center">
            <span className="text-sm text-muted">아직 등록된 리뷰가 없어요</span>
          </div>
        ) : (
          reviews.map((review) => (
            <ProductReviewCard
              key={review.id}
              authorName={review.nickname}
              rating={review.rating}
              date={DateTime.fromISO(review.createdAt).toFormat("yy.MM.dd")}
              content={review.content}
              imageUrls={review.imageUrls}
              sellerReply={review.sellerReply}
            />
          ))
        )}
      </div>
    );
  }
);

ProductReviewSection.displayName = "ProductReviewSection";

export default ProductReviewSection;
