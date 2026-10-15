import { cn } from "~/lib/utils";
import BottomButtonArea from "./bottom-button-area";
import type { HeaderProps } from "./header";
import Header from "./header";

interface ContentProps {
  children: React.ReactNode;
  headerPorps?: HeaderProps;
  footer?: React.ReactNode;
  /** 스크롤 영역 배경 등 — 시안의 회색 바탕 + 흰 카드 화면은 bg-gray-50 */
  className?: string;
  /** 히어로 이미지 위에 버튼을 띄우는 화면(스토어·상품 상세)은 기본 헤더를 숨김 */
  hideHeader?: boolean;
}

export default function Content({
  children,
  headerPorps,
  footer,
  className,
  hideHeader = false,
}: ContentProps) {
  return (
    <div className="flex flex-col w-full h-screen overflow-x-hidden">
      {!hideHeader && <Header {...headerPorps} />}
      <main
        data-slot="content-main"
        className={cn("flex-1 min-h-0 overflow-y-auto w-full", className)}
      >
        <div className={cn({ "pb-[5.5rem]": footer })}>{children}</div>
      </main>
      {footer && <BottomButtonArea>{footer}</BottomButtonArea>}
    </div>
  );
}
