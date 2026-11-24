import { useRef } from "react";
import { cn } from "~/lib/utils";
import { PullToRefreshIndicator, usePullToRefresh } from "./pull-to-refresh";
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
  /** 당겨서 새로고침 — 다른 사람이 내용을 바꾸는 단순 목록 화면에만 (pull-to-refresh.tsx 참고) */
  pullToRefresh?: boolean;
}

export default function Content({
  children,
  headerPorps,
  footer,
  className,
  hideHeader = false,
  pullToRefresh = false,
}: ContentProps) {
  const mainRef = useRef<HTMLElement>(null);
  const { distance, refreshing } = usePullToRefresh(mainRef, pullToRefresh);

  return (
    <div className="flex flex-col w-full h-screen overflow-x-hidden">
      {!hideHeader && <Header {...headerPorps} />}
      <main
        ref={mainRef}
        data-slot="content-main"
        className={cn("flex-1 min-h-0 overflow-y-auto w-full", className)}
      >
        {pullToRefresh && <PullToRefreshIndicator distance={distance} refreshing={refreshing} />}
        <div className={cn({ "pb-[5.5rem]": footer })}>{children}</div>
      </main>
      {footer && <BottomButtonArea>{footer}</BottomButtonArea>}
    </div>
  );
}
