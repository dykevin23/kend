import Content from "~/common/components/content";
import SupportContent from "~/common/components/support-content";

export default function SupportPage() {
  return (
    <Content headerPorps={{ title: "고객지원", useRight: false }}>
      <SupportContent />
    </Content>
  );
}
