import { Heart } from "lucide-react";
import Banner from "~/common/components/banner";
import Content from "~/common/components/content";
import { Badge } from "~/common/components/ui/badge";
import { cn } from "~/lib/utils";
import StoreCard from "../components/store-card";
import StoreCategoryTab from "../components/store-category-tab";

export default function StoresPage() {
  return (
    <Content headerPorps={{ title: "스토어" }}>
      <Banner />

      <div className="flex flex-col w-full items-start gap-6 pt-5">
        <StoreCategoryTab />

        {/* 스토어 start */}
        {Array.from({ length: 10 }).map((_, index) => (
          <StoreCard storeId={`store-${index}`} key={`store-${index}`} />
        ))}
        {/* 스토어 end */}
      </div>
    </Content>
  );
}
