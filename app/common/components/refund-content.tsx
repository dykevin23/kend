type RefundEntry =
  | { type: "chapter"; title: string }
  | { type: "article"; title: string; body: string };

const REFUND_ENTRIES: RefundEntry[] = [
  {
    type: "article",
    title: "적용 범위",
    body: "본 정책은 KEND 플랫폼에 입점한 모든 제휴사(판매자)의 상품에 공통으로 적용되는 교환·반품·환불 기준입니다. 제휴사별로 별도의 정책을 두지 않으며, 관련 법령(전자상거래 등에서의 소비자보호에 관한 법률)이 정한 최소 기준을 반영합니다.",
  },
  {
    type: "article",
    title: "신청 방법",
    body: "KEND 앱 내 주문상세 화면에서 반품을 원하는 상품을 선택하여 신청합니다(이메일·게시판 접수 없이 앱에서 바로 처리). 반품 신청은 상품 배송완료 후, 구매확정 전이면서 아래 신청 기한 이내에만 가능합니다.",
  },
  {
    type: "article",
    title: "신청 기한 (배송완료일 기준)",
    body: "1. 단순변심: 7일 이내\n2. 상품하자: 30일 이내\n3. 오배송: 30일 이내\n4. 배송 중 파손: 30일 이내\n5. 배송 중 분실: 30일 이내\n\n위 기간은 전자상거래법상 청약철회 관련 법정 최소 기간을 코드 기준으로 고정한 값입니다.",
  },
  {
    type: "article",
    title: "반품 배송비 부담",
    body: "1. 단순변심으로 인한 반품: 왕복 배송비를 구매자가 부담합니다.\n2. 상품하자·오배송·배송 중 파손·배송 중 분실로 인한 반품: 배송비를 판매자(제휴사)가 부담합니다.",
  },
  {
    type: "article",
    title: "처리 절차",
    body: "1. 구매자가 앱에서 반품 신청(사유 선택)\n2. 판매자 1차 확인(승인 또는 거절)\n3. 상품 회수\n4. 판매자 검수\n5. 검수 후 최종 승인 또는 거절\n\n최종 승인이 완료되면 결제수단으로 환불이 진행됩니다.",
  },
  {
    type: "article",
    title: "환불 처리 기한",
    body: "판매자가 반품 상품의 회수를 확인한 날로부터 3영업일 이내에 이미 지급받은 대금을 환급합니다. 신용카드 등으로 결제한 경우 해당 결제수단 제공자에게 지체 없이 청구정지 또는 취소를 요청합니다.",
  },
  {
    type: "article",
    title: "환불이 제한되는 경우",
    body: "다음의 경우에는 청약철회(반품·환불)가 제한될 수 있습니다.\n1. 구매자에게 책임 있는 사유로 상품이 멸실 또는 훼손된 경우\n2. 구매자의 사용 또는 일부 소비로 상품 가치가 현저히 감소한 경우\n3. 시간 경과로 재판매가 곤란할 정도로 상품 가치가 현저히 감소한 경우\n4. 복제가 가능한 상품의 포장을 훼손한 경우\n\n다만 상품 내용이 표시·광고와 다르거나 계약 내용과 다르게 이행된 경우에는 관련 법령이 정한 기간 내에 청약철회가 가능합니다.",
  },
  {
    type: "article",
    title: "안내",
    body: "KEND는 통신판매중개자로서 제휴사와 구매자 간 거래를 중개하며, 반품·환불 절차는 위 공통 정책에 따라 플랫폼이 통합 관리합니다. 세부 문의는 앱 내 문의하기를 통해 접수해주세요.",
  },
];

const EFFECTIVE_DATE = "2026년 9월 1일";

export default function RefundContent() {
  return (
    <div className="flex flex-col w-full px-4 py-5 gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold leading-6">교환·반품·환불 정책</span>
        <span className="text-xs text-muted">시행일: {EFFECTIVE_DATE}</span>
      </div>
      <div className="flex flex-col gap-5">
        {REFUND_ENTRIES.map((entry, index) =>
          entry.type === "chapter" ? (
            <div key={`${entry.title}-${index}`} className="flex flex-col pt-2">
              <span className="text-base font-bold leading-6">{entry.title}</span>
            </div>
          ) : (
            <div key={`${entry.title}-${index}`} className="flex flex-col gap-2">
              <span className="text-sm font-bold leading-5">{entry.title}</span>
              <span className="text-sm text-muted leading-5 whitespace-pre-line">
                {entry.body}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
