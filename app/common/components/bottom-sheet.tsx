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
        className="pb-20 rounded-t-3xl flex px-6 flex-col items-start"
        side="bottom"
        onClose={() => setOpen(false)}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}
