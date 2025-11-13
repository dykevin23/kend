import { cn } from "~/lib/utils";

interface DividerProps {
  className?: string | object;
}

export default function Divider({ className }: DividerProps) {
  return <div className={cn(`border-b-5 border-b-muted/10`, className)} />;
}
