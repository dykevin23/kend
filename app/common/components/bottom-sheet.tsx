import { Sheet, SheetClose, SheetContent, SheetFooter } from "./ui/sheet";

interface BottomSheetProps {
  open: boolean;
  children: React.ReactNode;
}

export default function BottomSheet({ open, children }: BottomSheetProps) {
  return (
    <Sheet open={open}>
      <SheetContent
        className="pb-20 rounded-t-3xl flex px-6 flex-col items-start"
        side="bottom"
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}
