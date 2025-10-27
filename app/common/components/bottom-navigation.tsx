import { House } from "lucide-react";
import { cn } from "~/lib/utils";

export default function BottomNavigation() {
  return (
    <nav
      className={cn(
        "flex w-full h-14 py-2.5 px-6 justify-between items-start self-stretch fixed bottom-0",
        "border-t-1 border-t-muted/30 bg-white"
      )}
    >
      <div className="flex flex-col w-18 items-center gap-1">
        <div className="flex flex-col items-center">
          <House className="size-7" />
        </div>
        <span className="text-center text-xs leading-3 tracking-[-0.4px]">
          스토어
        </span>
      </div>

      <div className="flex flex-col w-18 items-center gap-1">
        <div className="flex flex-col items-center">
          <House className="size-7" />
        </div>
        <span className="text-center text-xs leading-3 tracking-[-0.4px]">
          스토어
        </span>
      </div>

      <div className="flex flex-col w-18 items-center gap-1">
        <div className="flex flex-col items-center">
          <House className="size-7" />
        </div>
        <span className="text-center text-xs leading-3 tracking-[-0.4px]">
          스토어
        </span>
      </div>

      <div className="flex flex-col w-18 items-center gap-1">
        <div className="flex flex-col items-center">
          <House className="size-7" />
        </div>
        <span className="text-center text-xs leading-3 tracking-[-0.4px]">
          스토어
        </span>
      </div>
    </nav>
  );
}
