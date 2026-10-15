import { cn } from "~/lib/utils";

interface DividerProps {
  className?: string | object;
}

// 섹션 구분 — 시안의 8px 회색 띠
export default function Divider({ className }: DividerProps) {
  return <div className={cn("h-2 shrink-0 bg-gray-50", className)} />;
}
