/**
 * 사업자정보 (footer, 서비스 소개 페이지 등 공통 노출용)
 * 사업자등록증 기재 내용과 완전히 일치해야 함.
 */
export const COMPANY_INFO = {
  name: "주식회사 에이드노션 (Aidenotion Inc.)",
  ceo: "이경근",
  businessRegistrationNumber: "624-87-03600",
  address: "서울특별시 서초구 명달로 122-12, 502호(서초동, 코지밸리 비)",
  phone: "010-9968-3613",
  // 통신판매업신고는 Toss PG계약(구매안전서비스 이용확인증 발급) 이후 진행 가능 — 신고 완료 후 값 채울 것.
  mailOrderSalesRegistrationNumber: null as string | null,
} as const;
