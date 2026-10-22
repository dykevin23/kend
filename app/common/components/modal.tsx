import { X } from "lucide-react";
import { cn } from "~/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./ui/dialog";

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** 헤더 우측에 표시할 콘텐츠 (닫기 버튼과 대칭 위치) */
  headerRight?: React.ReactNode;
  /** 본문 스크롤 영역 클래스 — 결제처럼 회색 바탕 + 카드 화면은 bg-gray-50 */
  bodyClassName?: string;
  onClose: () => void;
}

export default function Modal({
  open,
  title,
  children,
  footer,
  headerRight,
  bodyClassName,
  onClose,
}: ModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="flex flex-col w-full h-full rounded-none border-0"
        showCloseButton={false}
      >
        <DialogHeader className="relative flex flex-row h-13 shrink-0 items-center justify-between px-1.5 border-b border-gray-100">
          <button
            type="button"
            className="flex size-[38px] items-center justify-center text-gray-900"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="size-[22px]" strokeWidth={2} />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-gray-900">
            {title}
          </span>
          <div className="flex size-[38px] items-center justify-center">
            {headerRight}
          </div>
        </DialogHeader>

        <div className={cn("flex flex-col flex-1 overflow-y-auto", bodyClassName)}>
          {children}
        </div>

        {footer && (
          <DialogFooter
            className="flex w-full min-h-18 px-5 pt-3 justify-center items-center gap-1.5 shrink-0 bg-white border-t border-gray-200 shadow-[0_-6px_16px_rgba(15,33,56,0.05)] pb-[max(0.75rem,var(--safe-area-inset-bottom))]"
            style={{
              position: "sticky",
              bottom: 0,
            }}
          >
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
