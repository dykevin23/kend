import { COMPANY_INFO } from "~/common/constants/company-info";

export default function CompanyFooter() {
  return (
    <div className="flex flex-col gap-1 px-4 py-6 text-xs text-muted leading-5 bg-gray-50">
      <span>{COMPANY_INFO.name}</span>
      <span>대표자: {COMPANY_INFO.ceo}</span>
      <span>사업자등록번호: {COMPANY_INFO.businessRegistrationNumber}</span>
      <span>사업장 주소: {COMPANY_INFO.address}</span>
      <span>고객센터: {COMPANY_INFO.phone}</span>
      {COMPANY_INFO.mailOrderSalesRegistrationNumber && (
        <span>통신판매업신고번호: {COMPANY_INFO.mailOrderSalesRegistrationNumber}</span>
      )}
    </div>
  );
}
