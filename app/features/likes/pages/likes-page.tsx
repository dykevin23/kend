import { useState } from "react";
import { redirect, useLoaderData } from "react-router";
import Content from "~/common/components/content";
import { Tab, Tabs } from "~/common/components/tabs";
import LikeProductCard from "../components/like-product-card";
import { makeSSRClient } from "~/supa-client";
import { getLikedProducts } from "../queries";
import type { Route } from "./+types/likes-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login", { headers });
  }

  const likedProducts = await getLikedProducts(client, user.id);
  return { likedProducts };
};

export default function LikesPage() {
  const { likedProducts } = useLoaderData<typeof loader>();
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
            likedProducts.length > 0 ? (
              likedProducts.map((item) => (
                <LikeProductCard key={item.productId} item={item} />
              ))
            ) : (
              <div className="flex w-full py-10 justify-center items-center">
                <span className="text-muted">좋아요한 상품이 없습니다.</span>
              </div>
            )
          ) : (
            <div className="flex w-full py-10 justify-center items-center">
              <span className="text-muted">찜한 스토어가 없습니다.</span>
            </div>
          )}
        </div>
      </div>
    </Content>
  );
}
