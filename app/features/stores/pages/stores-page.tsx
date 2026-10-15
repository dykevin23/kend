import { useState } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/stores-page";
import Banner from "~/common/components/banner";
import Content from "~/common/components/content";
import { Tab, Tabs } from "~/common/components/tabs";
import { makeSSRClient } from "~/supa-client";
import { makeCachedClientLoader } from "~/lib/with-client-cache";
import { getDomains, getStoresWithProducts, getRandomBanners } from "../queries";
import StoreCard from "../components/store-card";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const [stores, domains, bannerImages] = await Promise.all([
    getStoresWithProducts(client),
    getDomains(client),
    getRandomBanners(client),
  ]);
  return { stores, domains, bannerImages };
};

export const clientLoader =
  makeCachedClientLoader<Awaited<ReturnType<typeof loader>>>();

export default function StoresPage() {
  const { stores, domains, bannerImages } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<string>("all");

  const handleClickTab = (key: string) => () => {
    setActiveTab(key);
  };

  // 탭에 따른 스토어 필터링
  const filteredStores =
    activeTab === "all"
      ? stores
      : stores.filter((store) => store.domainId === activeTab);

  return (
    <Content headerPorps={{ title: "스토어" }} className="bg-gray-50">
      <Tabs scrollable className="sticky top-0 z-10">
        <Tab
          title="전체"
          isActive={activeTab === "all"}
          onClick={handleClickTab("all")}
        />
        {domains.map((domain) => (
          <Tab
            key={domain.id}
            title={domain.name}
            isActive={activeTab === domain.id}
            onClick={handleClickTab(domain.id)}
          />
        ))}
      </Tabs>

      <div className="flex flex-col gap-[18px] pt-[18px] pb-24">
        <Banner images={bannerImages} />

        <div className="flex flex-col gap-[18px] px-5">
          {filteredStores.length === 0 ? (
            <div className="flex w-full py-10 justify-center items-center">
              <span className="text-sm text-gray-500">등록된 스토어가 없습니다.</span>
            </div>
          ) : (
            filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))
          )}
        </div>
      </div>
    </Content>
  );
}
