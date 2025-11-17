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
        "flex w-full h-18 p-4 fixed bottom-0 justify-center items-center gap-1.5 shrink-0 border-t-1 border-t-muted-foreground/30 bg-white",
        className
      )}
    >
      {children}
    </div>
  );
}
