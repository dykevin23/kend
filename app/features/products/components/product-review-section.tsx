import { forwardRef } from "react";
import { ChevronRight } from "lucide-react";
import {
  productSample3,
  productSample4,
  productSample5,
} from "~/assets/images";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import ProductReviewCard from "./product-review-card";

interface ProductReviewSectionProps {
  totalReviews?: number;
}

// 샘플 리뷰 데이터
const sampleReviews = [
  {
    id: 1,
    authorName: "채림이 아빠",
    rating: 5,
    date: "25.09.10",
    options: [
      { label: "색상", value: "베이지" },
      { label: "사이즈", value: "24M" },
      { label: "키/몸무게", value: "85cm/12kg" },
    ],
    content:
      "소재가 일반 면은 아닌것 같아요. 쿨링 감이 있는것 같아서 한 여름에도 시원하게 입힐 수 있을 것 같아요. 너무 딱 달라붙지도 않아서 아이가 활동하기 편해요...",
    commentCount: 5,
  },
  {
    id: 2,
    authorName: "민준이 엄마",
    rating: 4,
    date: "25.09.08",
    options: [
      { label: "색상", value: "네이비" },
      { label: "사이즈", value: "36M" },
    ],
    content:
      "배송도 빠르고 품질도 좋아요. 아이가 입기 편해하네요. 다만 색상이 사진보다 조금 어두워요...",
    commentCount: 3,
  },
  {
    id: 3,
    authorName: "서연이 아빠",
    rating: 5,
    date: "25.09.05",
    options: [
      { label: "색상", value: "화이트" },
      { label: "사이즈", value: "18M" },
    ],
    content:
      "정말 만족스러워요! 세탁 후에도 모양이 잘 유지되고, 아이 피부에도 자극이 없어요...",
    commentCount: 2,
  },
];

const ProductReviewSection = forwardRef<
  HTMLDivElement,
  ProductReviewSectionProps
>(({ totalReviews = 4321 }, ref) => {
  return (
    <div ref={ref} className="flex w-full p-4 flex-col items-start gap-2.5">
      <div className="flex p-4 items-center gap-2 self-stretch border-b-1 border-b-muted-foreground/10">
        <div className="flex items-center gap-1 flex-gsb">
          <span className="text-lg font-bold leading-[100%] tracking-[-0.4px]">
            리뷰
          </span>
          <span className="text-base leading-[100%] tracking-[-0.4px] text-muted/50">
            ({totalReviews.toLocaleString()})
          </span>
        </div>
      </div>

      <div className="flex px-4 justify-end items-center self-stretch">
        <span className="text-xs leading-[100%]">전체보기</span>
        <ChevronRight size={16} />
      </div>

      {/* 리뷰 이미지 미리보기 */}
      <div className="flex w-full h-18 flex-col items-start gap-2.5 overflow-hidden">
        <div className="flex justify-end items-center self-stretch overflow-x-auto">
          <div className="flex w-full h-18 items-center gap-2.5">
            <div className="flex h-18 flex-col justify-end items-start gap-2.5 flex-gsb">
              <div className="flex pr-4 items-center gap-1">
                <img
                  src={productSample3}
                  className="flex justify-center items-center size-18"
                />
                <img
                  src={productSample4}
                  className="flex justify-center items-center size-18"
                />
                <img
                  src={productSample5}
                  className="flex justify-center items-center size-18"
                />
                <img
                  src={productSample3}
                  className="flex justify-center items-center size-18"
                />
                <img
                  src={productSample4}
                  className="flex justify-center items-center size-18"
                />
                <img
                  src={productSample5}
                  className="flex justify-center items-center size-18"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 카드 목록 */}
      {sampleReviews.map((review) => (
        <ProductReviewCard
          key={review.id}
          authorName={review.authorName}
          rating={review.rating}
          date={review.date}
          options={review.options}
          content={review.content}
          commentCount={review.commentCount}
        />
      ))}

      {/* 모든 리뷰 보기 버튼 */}
      <div className="flex px-4 flex-col justify-center items-center self-stretch mt-4">
        <Button
          variant="outline"
          className={cn(
            "flex w-full h-9 px-7.5 justify-center items-center rounded-full border-1 border-secondary",
            "text-sm font-bold leading-[100%] tracking-[-0.4px] text-secondary"
          )}
        >
          모든 리뷰 보기 ({totalReviews.toLocaleString()})
        </Button>
      </div>
    </div>
  );
});

ProductReviewSection.displayName = "ProductReviewSection";

export default ProductReviewSection;
