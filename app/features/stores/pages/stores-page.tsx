import { useState } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/stores-page";
import Banner from "~/common/components/banner";
import Content from "~/common/components/content";
import { Tab, Tabs } from "~/common/components/tabs";
import { makeSSRClient } from "~/supa-client";
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

// 클라이언트 측 캐시: swipe back 등 라우트 재진입 시 loader 재실행 방지.
// React Router v7의 single fetch는 매 navigation마다 loader를 재실행하므로,
// clientLoader로 직접 캐시한다. mutation 후엔 별도 무효화 필요.
const clientCache = new Map<string, unknown>();

export const clientLoader = async ({
  request,
  serverLoader,
}: Route.ClientLoaderArgs) => {
  const url = new URL(request.url);
  const key = url.pathname + url.search;
  if (clientCache.has(key)) {
    return clientCache.get(key) as Awaited<ReturnType<typeof loader>>;
  }
  const data = await serverLoader();
  clientCache.set(key, data);
  return data;
};
clientLoader.hydrate = true as const;

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
    <Content headerPorps={{ title: "스토어" }}>
      <div className="pb-20">
      <Banner images={bannerImages} />

      <div className="flex flex-col w-full items-start gap-6 pt-5">
        <Tabs>
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

        {filteredStores.length === 0 ? (
          <div className="flex w-full py-10 justify-center items-center">
            <span className="text-muted">등록된 스토어가 없습니다.</span>
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
