import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "~/lib/utils";
import CartIcon from "./cart-icon";

export const floatingIconButtonClass =
  "flex size-[38px] items-center justify-center rounded-full bg-navy-900/35 text-white backdrop-blur-[2px]";

/**
 * 히어로 이미지 위에 떠 있는 반투명 원형 버튼 바 (스토어·상품 상세).
 * sticky + h-0이라 레이아웃을 차지하지 않고 스크롤 중에도 상단에 남는다.
 */
export default function FloatingHeader({ right }: { right?: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-20 h-0">
      <div className="flex justify-between items-start px-3 pt-3">
        <button
          type="button"
          className={floatingIconButtonClass}
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-[22px]" strokeWidth={2} />
        </button>
        <div className="flex gap-2">
          {right}
          <CartIcon className={cn(floatingIconButtonClass, "[&_svg]:size-5")} />
        </div>
      </div>
    </div>
  );
}
