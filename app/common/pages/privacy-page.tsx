import Content from "~/common/components/content";
import PrivacyContent from "~/common/components/privacy-content";

export default function PublicPrivacyPage() {
  return (
    <Content headerPorps={{ title: "개인정보 처리 방침", useRight: false }}>
      <PrivacyContent />
    </Content>
  );
}
