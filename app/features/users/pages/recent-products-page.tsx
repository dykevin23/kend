import { Package } from "lucide-react";
import Content from "~/common/components/content";

export default function RecentProductsPage() {
  return (
    <Content headerPorps={{ title: "최근 본 상품", useRight: false }}>
      <div className="flex flex-col items-center justify-center w-full py-20 px-4 gap-3">
        <Package className="w-12 h-12 text-muted/40" />
        <span className="text-base font-medium text-muted">
          최근 본 상품이 없습니다
        </span>
        <span className="text-sm text-muted/60 text-center">
          상품을 둘러보고 관심 있는 상품을 확인해보세요.
        </span>
      </div>
    </Content>
  );
}
