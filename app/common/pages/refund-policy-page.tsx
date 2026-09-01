import Content from "~/common/components/content";
import RefundContent from "~/common/components/refund-content";

export default function PublicRefundPolicyPage() {
  return (
    <Content headerPorps={{ title: "교환·반품·환불 정책", useRight: false }}>
      <RefundContent />
    </Content>
  );
}
