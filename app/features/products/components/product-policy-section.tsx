import { Link } from "react-router";

export default function ProductPolicySection() {
  return (
    <div className="flex flex-col w-full gap-5 py-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold leading-5">배송안내</span>
        <div className="flex flex-col gap-1 text-sm text-muted leading-5">
          <div className="flex gap-2">
            <span className="w-16 shrink-0 font-medium text-gray-900">배송비</span>
            <span>상품별로 상이하며, 구매 시 결제 화면에서 확인할 수 있습니다.</span>
          </div>
          <div className="flex gap-2">
            <span className="w-16 shrink-0 font-medium text-gray-900">배송기간</span>
            <span>판매자 확인 후 3영업일 이내 발송됩니다.</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold leading-5">교환 및 반품 안내</span>
        <div className="flex flex-col gap-1 text-sm text-muted leading-5">
          <div className="flex gap-2">
            <span className="w-16 shrink-0 font-medium text-gray-900">신청방법</span>
            <span>주문상세 화면에서 반품 신청</span>
          </div>
          <div className="flex gap-2">
            <span className="w-16 shrink-0 font-medium text-gray-900">신청기한</span>
            <span>단순변심 7일 / 하자·오배송·파손·분실 30일 (배송완료일 기준)</span>
          </div>
          <div className="flex gap-2">
            <span className="w-16 shrink-0 font-medium text-gray-900">배송비</span>
            <span>단순변심은 구매자 부담, 하자·오배송·파손·분실은 판매자 부담</span>
          </div>
        </div>
        <Link to="/myPage/refund-policy" className="text-sm text-secondary underline w-fit">
          교환·반품·환불 정책 자세히 보기
        </Link>
      </div>
    </div>
  );
}
