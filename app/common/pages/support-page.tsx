import Content from "~/common/components/content";
import SupportContent from "~/common/components/support-content";

// 공개 고객지원 페이지 — App Store Connect "지원 URL"(https://kend.co.kr/support)용, 로그인 불필요.
export const meta = () => [{ title: "고객지원 | KEND" }];

export default function PublicSupportPage() {
  return (
    <Content headerPorps={{ title: "고객지원", useRight: false }}>
      <SupportContent />
    </Content>
  );
}
