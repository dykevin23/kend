import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { cn } from "~/lib/utils";
import CartIcon from "./cart-icon";

/** 떠 있는 버튼 바의 높이 — 아래에 붙는 sticky 요소는 top-[62px]로 맞춘다 */
export const FLOATING_HEADER_HEIGHT = 62;

export const floatingIconButtonClass =
  "flex size-[38px] items-center justify-center rounded-full bg-navy-900/35 text-white backdrop-blur-[2px] transition-colors";

// 히어로를 지나 흰 헤더로 바뀐 뒤의 버튼 모양
const solidIconButtonClass = "bg-transparent text-gray-900 backdrop-blur-none";

interface FloatingHeaderProps {
  right?: React.ReactNode | ((solid: boolean) => React.ReactNode);
  /** 히어로 이미지의 세로/가로 비율 — 이만큼 스크롤하면 흰 헤더로 전환 (16:9 → 9/16) */
  heroRatio: number;
}

/**
 * 히어로 이미지 위에 떠 있는 반투명 원형 버튼 바 (스토어·상품 상세).
 * sticky + h-0이라 레이아웃을 차지하지 않고, 히어로를 지나면 흰 헤더가 된다.
 */
export default function FloatingHeader({ right, heroRatio }: FloatingHeaderProps) {
  const navigate = useNavigate();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const main = document.querySelector('[data-slot="content-main"]');
    if (!main) return;
    const handleScroll = () =>
      setSolid(
        main.scrollTop > main.clientWidth * heroRatio - FLOATING_HEADER_HEIGHT
      );
    handleScroll();
    main.addEventListener("scroll", handleScroll, { passive: true });
    return () => main.removeEventListener("scroll", handleScroll);
  }, [heroRatio]);

  const buttonClass = cn(floatingIconButtonClass, solid && solidIconButtonClass);

  return (
    <div className="sticky top-0 z-20 h-0">
      <div
        className={cn(
          "flex h-[62px] justify-between items-center px-3 transition-colors",
          solid && "bg-white border-b border-gray-100"
        )}
      >
        <button
          type="button"
          className={buttonClass}
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-[22px]" strokeWidth={2} />
        </button>
        <div className="flex gap-2">
          {typeof right === "function" ? right(solid) : right}
          <CartIcon className={cn(buttonClass, "[&_svg]:size-5")} />
        </div>
      </div>
    </div>
  );
}
