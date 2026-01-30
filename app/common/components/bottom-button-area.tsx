import { cn } from "~/lib/utils";

interface BottomButtonAreaProps {
  children: React.ReactNode;
  className?: string | object;
}

export default function BottomButtonArea({
  children,
  className,
}: BottomButtonAreaProps) {
  return (
    <div
      className={cn(
        "flex w-full min-h-18 p-4 justify-center items-center gap-1.5 shrink-0 border-t-1 border-t-muted-foreground/30 bg-white",
        "pb-[max(1rem,var(--safe-area-inset-bottom))]",
        className
      )}
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 50,
      }}
    >
      {children}
    </div>
  );
}
