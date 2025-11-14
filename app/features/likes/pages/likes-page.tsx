import { useState } from "react";
import Content from "~/common/components/content";
import { Tab, Tabs } from "~/common/components/tabs";
import LikeProductCard from "../components/like-product-card";

export default function LikesPage() {
  const [isActiveTab, setIsActiveTab] = useState<string>("product");

  const handleClickTab = (key: string) => () => {
    setIsActiveTab(key);
  };
  return (
    <Content headerPorps={{ title: "좋아요" }}>
      <div className="flex w-full items-center">
        <Tabs>
          <Tab
            title="제품"
            isActive={isActiveTab === "product"}
            onClick={handleClickTab("product")}
          />
          <Tab
            title="스토어"
            isActive={isActiveTab === "store"}
            onClick={handleClickTab("store")}
          />
        </Tabs>
      </div>

      <div className="flex w-full flex-col items-start gap-4 mt-1">
        {Array.from({ length: 15 }).map((_, index) => (
          <LikeProductCard
            key={`product-${index}`}
            productId={`product-${index}`}
          />
        ))}
      </div>
    </Content>
  );
}
