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
      <div className="pb-20">
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
        {isActiveTab === "product" ? (
          // TODO: likes 테이블 구현 후 실제 데이터로 교체
          Array.from({ length: 5 }).map((_, index) => (
            <LikeProductCard
              key={`product-${index}`}
              productId={`product-${index}`}
            />
          ))
        ) : (
          // TODO: store_follows 테이블 구현 후 실제 데이터로 교체
          <div className="flex w-full py-10 justify-center items-center">
            <span className="text-muted">찜한 스토어가 없습니다.</span>
          </div>
        )}
      </div>
      </div>
    </Content>
  );
}
