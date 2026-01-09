import Banner from "~/common/components/banner";
import Content from "~/common/components/content";
import { StoreInfo } from "../components/store-card";
import ProductCard from "~/features/products/components/product-card";
import { useState } from "react";
import { Tab, Tabs } from "~/common/components/tabs";

export default function StorePage() {
  const [isActiveTab, setIsActiveTab] = useState<string>("home");

  const handleClickTab = (key: string) => () => {
    setIsActiveTab(key);
  };

  return (
    <Content>
      <Banner />

      <div className="flex flex-col h-12 px-4 items-start shrink-0 self-stretch pt-2.5">
        <div className="flex flex-col pr-4 items-start shrink-0 self-stretch">
          <StoreInfo />
        </div>
      </div>

      <div className="flex flex-col w-full items-start gap-6 pt-5">
        <Tabs>
          <Tab
            title="홈"
            isActive={isActiveTab === "home"}
            onClick={handleClickTab("home")}
          />
          <Tab
            title="패션"
            isActive={isActiveTab === "fashion"}
            onClick={handleClickTab("fashion")}
          />
          <Tab
            title="스킨케어"
            isActive={isActiveTab === "skincare"}
            onClick={handleClickTab("skincare")}
          />
          <Tab
            title="액티비티"
            isActive={isActiveTab === "activity"}
            onClick={handleClickTab("activity")}
          />
          <Tab
            title="라이프"
            isActive={isActiveTab === "life"}
            onClick={handleClickTab("life")}
          />
        </Tabs>

        <div className="grid grid-cols-3 gap-1 px-1 w-full box-border">
          {Array.from({ length: 15 }).map((_, index) => (
            <ProductCard
              key={`product-${index}`}
              productId={`product-${index}`}
            />
          ))}
        </div>
      </div>
    </Content>
  );
}
