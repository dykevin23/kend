import type { Dispatch, SetStateAction } from "react";
import { Sheet, SheetContent } from "./ui/sheet";

interface BottomSheetProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}

export default function BottomSheet({
  open,
  setOpen,
  children,
}: BottomSheetProps) {
  return (
    <Sheet open={open}>
      <SheetContent
        className="pb-[max(2rem,var(--safe-area-inset-bottom))] pt-2.5 rounded-t-[26px] border-none shadow-[0_-20px_50px_rgba(11,33,56,0.3)] flex px-5 flex-col items-start"
        side="bottom"
        onClose={() => setOpen(false)}
      >
        <div className="w-10 h-1 mx-auto rounded-full bg-gray-200" />
        {children}
      </SheetContent>
    </Sheet>
  );
}
