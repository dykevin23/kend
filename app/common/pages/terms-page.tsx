import Content from "~/common/components/content";
import TermsContent from "~/common/components/terms-content";

export default function PublicTermsPage() {
  return (
    <Content headerPorps={{ title: "이용 약관", useRight: false }}>
      <TermsContent />
    </Content>
  );
}
