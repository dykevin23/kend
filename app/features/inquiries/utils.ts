import type { InquiryCategory, InquiryStatus } from "./types";

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  DELIVERY: "배송",
  PRODUCT: "상품",
  PAYMENT: "결제",
  ETC: "기타",
};

export function getInquiryStatusLabel(status: InquiryStatus): {
  label: string;
  color: string;
} {
  switch (status) {
    case "answered":
      return { label: "답변완료", color: "text-green-600" };
    case "pending":
    default:
      return { label: "답변대기", color: "text-gray-500" };
  }
}
