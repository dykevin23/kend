import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// app.css @theme에 추가한 radius/shadow 토큰을 알려줘야 rounded-lg·shadow-xs 등과 충돌 정리가 됨
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["card", "thumb"],
      shadow: ["card-sm", "card-md", "card-lg", "cta"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const number = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(number)) return "0";
  return number.toLocaleString("ko-KR");
}
