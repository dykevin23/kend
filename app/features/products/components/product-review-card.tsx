import StarRating from "~/common/components/star-rating";

interface ProductReviewCardProps {
  authorName: string;
  rating: number;
  date: string;
  content: string;
  imageUrls?: string[];
  sellerReply?: string | null;
}

export default function ProductReviewCard({
  authorName,
  rating,
  date,
  content,
  imageUrls = [],
  sellerReply,
}: ProductReviewCardProps) {
  return (
    <div className="flex flex-col items-start gap-2.5 self-stretch">
      <div className="flex flex-col justify-center items-start gap-1 self-stretch">
        <div className="flex items-center gap-2 self-stretch">
          <div className="size-10 aspect-square bg-muted rounded-full"></div>
          <div className="flex h-12 pr-4 justify-between items-center flex-gsb">
            <div className="flex h-6 justify-center items-center flex-gsb">
              <span className="text-xs font-bold leading-[100%] flex-gsb">
                {authorName}
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full pr-4 justify-between items-center">
          <StarRating score={rating} />
          <span className="text-xs leading-[100%] text-muted/50 whitespace-nowrap shrink-0">
            {date} 등록
          </span>
        </div>

        <div className="flex p-2.5 flex-col items-start gap-1 self-stretch">
          <div className="flex w-full flex-col justify-center">
            <span className="text-xs leading-[150%] tracking-[-0.4px] whitespace-pre-line">
              {content}
            </span>
          </div>
        </div>

        {imageUrls.length > 0 && (
          <div className="flex px-2.5 items-center gap-1.5 overflow-x-auto self-stretch">
            {imageUrls.map((url) => (
              <img
                key={url}
                src={url}
                alt="리뷰 사진"
                className="size-16 shrink-0 rounded-md object-cover"
              />
            ))}
          </div>
        )}

        {sellerReply && (
          <div className="flex p-2.5 flex-col items-start gap-1 self-stretch ml-4 rounded-md bg-muted/10">
            <span className="text-xs font-bold text-secondary">판매자 답변</span>
            <span className="text-xs leading-[150%] tracking-[-0.4px] whitespace-pre-line">
              {sellerReply}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
