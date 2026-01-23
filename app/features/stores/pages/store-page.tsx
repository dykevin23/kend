import { useState } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/store-page";
import Banner from "~/common/components/banner";
import Content from "~/common/components/content";
import { Tab, Tabs } from "~/common/components/tabs";
import { makeSSRClient } from "~/supa-client";
import { getStoreByCode, getProductsBySeller, getMainCategories } from "../queries";
import { StoreInfo } from "../components/store-card";
import ProductCard from "~/features/products/components/product-card";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { storeId: sellerCode } = params;

  const store = await getStoreByCode(client, sellerCode);
  const [products, mainCategories] = await Promise.all([
    getProductsBySeller(client, store.id),
    getMainCategories(client, store.domainId ?? undefined),
  ]);

  return { store, products, mainCategories };
};

export default function StorePage() {
  const { store, products, mainCategories } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<string>("all");

  const handleClickTab = (key: string) => () => {
    setActiveTab(key);
  };

  // 탭에 따른 상품 필터링 (mainCategory는 code 문자열)
  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((product) => product.mainCategory === activeTab);

  return (
    <Content>
      <Banner />

      <div className="flex flex-col h-12 px-4 items-start shrink-0 self-stretch pt-2.5">
        <div className="flex flex-col pr-4 items-start shrink-0 self-stretch">
          <StoreInfo
            name={store.name}
            profileImage={store.profileImage}
            hashtags={store.hashtags}
            followerCount={store.followerCount}
          />
        </div>
      </div>

      <div className="flex flex-col w-full items-start gap-6 pt-5">
        <Tabs>
          <Tab
            title="전체"
            isActive={activeTab === "all"}
            onClick={handleClickTab("all")}
          />
          {mainCategories.map((category) => (
            <Tab
              key={category.id}
              title={category.name}
              isActive={activeTab === category.id}
              onClick={handleClickTab(category.id)}
            />
          ))}
        </Tabs>

        {filteredProducts.length === 0 ? (
          <div className="flex w-full py-10 justify-center items-center">
            <span className="text-muted">등록된 상품이 없습니다.</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 px-1 w-full box-border">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Content>
  );
}
