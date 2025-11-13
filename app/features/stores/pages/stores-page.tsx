import Banner from "~/common/components/banner";
import Content from "~/common/components/content";
import StoreCard from "../components/store-card";
import { Tab, Tabs } from "~/common/components/tabs";
import { useState } from "react";

export default function StoresPage() {
  const [isActiveTab, setIsActiveTab] = useState<string>("home");

  const handleClickTab = (key: string) => () => {
    setIsActiveTab(key);
  };

  return (
    <Content headerPorps={{ title: "스토어" }}>
      <Banner />

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

        {/* 스토어 start */}
        {Array.from({ length: 10 }).map((_, index) => (
          <StoreCard storeId={`store-${index}`} key={`store-${index}`} />
        ))}
        {/* 스토어 end */}
      </div>
    </Content>
  );
}
