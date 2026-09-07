import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useLoaderData, useFetcher, useRevalidator } from "react-router";
import type { Route } from "./+types/store-page";
import Banner from "~/common/components/banner";
import Content from "~/common/components/content";
import { Tab, Tabs } from "~/common/components/tabs";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import { makeSSRClient } from "~/supa-client";
import { makeCachedClientLoader } from "~/lib/with-client-cache";
import {
  getStoreByCode,
  getProductsBySeller,
  getMainCategories,
  getSellerBanners,
} from "../queries";
import { isStoreLiked } from "~/features/likes/queries";
import { toggleStoreLike } from "~/features/likes/mutations";
import { StoreInfo } from "../components/store-card";
import ProductCard from "~/features/products/components/product-card";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { storeId: sellerCode } = params;

  const store = await getStoreByCode(client, sellerCode);
  const {
    data: { user },
  } = await client.auth.getUser();

  const [products, mainCategories, bannerImages, isLiked] = await Promise.all([
    getProductsBySeller(client, store.id),
    getMainCategories(client, store.domainId ?? undefined),
    getSellerBanners(client, store.id),
    user ? isStoreLiked(client, user.id, store.id) : Promise.resolve(false),
  ]);

  return { store, products, mainCategories, bannerImages, isLiked };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const sellerId = formData.get("sellerId") as string;

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const isLiked = await toggleStoreLike(client, user.id, sellerId);
  return { success: true, isLiked };
};

export const clientLoader =
  makeCachedClientLoader<Awaited<ReturnType<typeof loader>>>();

export default function StorePage() {
  const { store, products, mainCategories, bannerImages, isLiked } =
    useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<string>("all");
  const likeFetcher = useFetcher<typeof action>();
  const revalidator = useRevalidator();

  const optimisticIsLiked =
    likeFetcher.state !== "idle"
      ? !isLiked
      : (likeFetcher.data?.isLiked ?? isLiked);

  // 찜 토글은 mutation이라 캐시된 clientLoader가 stale해짐 — 캐시 무효화 후 재검증
  useEffect(() => {
    if (likeFetcher.state === "idle" && likeFetcher.data?.success) {
      clientLoader.invalidate(window.location.pathname + window.location.search);
      revalidator.revalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likeFetcher.state, likeFetcher.data]);

  const handleLikeClick = () => {
    likeFetcher.submit(
      { sellerId: store.id },
      { method: "POST" }
    );
  };

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
      <Banner images={bannerImages} />

      <div className="flex flex-col px-4 items-start shrink-0 self-stretch py-2.5 border-b border-muted/30">
        <div className="flex flex-col pr-4 items-start shrink-0 self-stretch">
          <StoreInfo
            name={store.name}
            profileImage={store.profileImage}
            hashtags={store.hashtags}
            followerCount={store.followerCount}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleLikeClick}
          disabled={likeFetcher.state !== "idle"}
          className={cn(
            "w-full gap-1.5 hover:bg-transparent hover:text-inherit",
            optimisticIsLiked && "border-secondary text-secondary"
          )}
        >
          <Heart
            className={cn("size-4", optimisticIsLiked && "fill-secondary")}
          />
          {optimisticIsLiked ? "찜한 스토어" : "스토어 찜하기"}
        </Button>
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
