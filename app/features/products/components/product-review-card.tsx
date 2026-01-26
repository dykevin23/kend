import { ChevronRight } from "lucide-react";
import StarRating from "~/common/components/star-rating";

interface ReviewOption {
  label: string;
  value: string;
}

interface ProductReviewCardProps {
  authorName: string;
  rating: number;
  date: string;
  options: ReviewOption[];
  content: string;
  commentCount: number;
}

export default function ProductReviewCard({
  authorName,
  rating,
  date,
  options,
  content,
  commentCount,
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
        <div className="flex w-full pr-4 justify-center items-center gap-25">
          <StarRating score={rating} />
          <div className="flex w-20 items-center gap-1 shrink-0">
            <span className="text-right text-xs leading-[100%] text-muted/50">
              등록 | {date}
            </span>
          </div>
        </div>

        <div className="flex p-2.5 flex-col items-start gap-1 self-stretch rounded-md bg-muted/10">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-6 self-stretch">
              <div className="flex items-start gap-5">
                <span className="text-xs text-center font-bold leading-[100%] tracking-[-0.4px] text-muted-foreground/50">
                  {option.label}
                </span>
              </div>
              <div className="flex items-start gap-5">
                <span className="text-xs text-center font-bold leading-[100%] tracking-[-0.4px] text-muted-foreground">
                  {option.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex p-2.5 flex-col items-start gap-1 self-stretch">
          <div className="flex w-full h-17 flex-col justify-center">
            <span className="text-xs leading-[150%] tracking-[-0.4px]">
              {content}
              <span className="text-[10px] font-bold leading-[100%] tracking-[-0.4px] text-muted-foreground/30 ml-1">
                더 보기
              </span>
            </span>
          </div>
        </div>

        <div className="flex px-2.5 justify-center items-center gap-1 self-stretch">
          <div className="flex justify-center items-center gap-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M11.4803 0.55751C11.1407 0.200271 10.6827 0 10.2093 0H1.80103C1.32247 0 0.864494 0.200271 0.530017 0.55751C0.19554 0.91475 0 1.39107 0 1.89445V11.3667C0 11.4804 0.0308748 11.5886 0.0823328 11.6861C0.133791 11.7835 0.210978 11.8647 0.303602 11.9188C0.391081 11.9729 0.493997 12 0.596913 12C0.704974 12 0.80789 11.9675 0.900515 11.9134L3.59691 10.1976C3.69468 10.1326 3.81304 10.1055 3.92624 10.111H10.199C10.6775 10.111 11.1355 9.91069 11.47 9.55345C11.8096 9.19621 12 8.71448 12 8.21651V1.89445C12 1.39107 11.8096 0.909337 11.47 0.55751H11.4803ZM3.60206 5.68336C3.27273 5.68336 3 5.40189 3 5.05007C3 4.69824 3.26758 4.41678 3.60206 4.41678C3.93654 4.41678 4.20412 4.69824 4.20412 5.05007C4.20412 5.40189 3.93654 5.68336 3.60206 5.68336ZM6.00515 5.68336C5.67582 5.68336 5.40309 5.40189 5.40309 5.05007C5.40309 4.69824 5.67067 4.41678 6.00515 4.41678C6.33962 4.41678 6.6072 4.69824 6.6072 5.05007C6.6072 5.40189 6.33962 5.68336 6.00515 5.68336ZM8.40309 5.68336C8.07376 5.68336 7.80103 5.40189 7.80103 5.05007C7.80103 4.69824 8.06861 4.41678 8.40309 4.41678C8.73756 4.41678 9.00515 4.69824 9.00515 5.05007C9.00515 5.40189 8.73756 5.68336 8.40309 5.68336Z"
                fill="#9F9F9F"
              />
            </svg>
            <span className="text-center text-[10px] leading-[100%] tracking-[-0.4px] text-muted-foreground/30">
              댓글 {commentCount}
            </span>
          </div>
          <div className="flex justify-end items-center flex-gsb">
            <span className="text-center text-[10px] leading-[100%] tracking-[-0.4px] text-muted-foreground/30">
              댓글 달기
            </span>
            <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
