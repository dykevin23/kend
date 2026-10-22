import { useImageError } from "~/hooks/useImageError";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useLoaderData, useFetcher, useRevalidator } from "react-router";
import type { Route } from "./+types/store-page";
import Banner from "~/common/components/banner";
import Content from "~/common/components/content";
import FloatingHeader from "~/common/components/floating-header";
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
    <Content hideHeader className="bg-white">
      <FloatingHeader heroRatio={9 / 16} />
      <Banner images={bannerImages} variant="hero" />

      <div className="flex flex-col px-5 pb-4 bg-white">
        <div className="flex items-end gap-3.5 -mt-8 relative">
          <StoreLogo name={store.name} profileImage={store.profileImage} />
          <div className="flex flex-1 justify-end pb-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLikeClick}
              disabled={likeFetcher.state !== "idle"}
              className={cn(
                "h-9 px-4 text-[13px] gap-1",
                optimisticIsLiked &&
                  "bg-primary text-primary-foreground hover:bg-primary active:bg-primary"
              )}
            >
              <Heart
                className={cn("size-4", optimisticIsLiked && "fill-current")}
              />
              {optimisticIsLiked ? "찜한 스토어" : "스토어 찜하기"}
            </Button>
          </div>
        </div>
        <span className="mt-3 text-[19px] font-extrabold text-gray-900">
          {store.name}
        </span>
        {store.hashtags && (
          <span className="mt-1.5 text-[13px] leading-normal text-gray-500">
            {store.hashtags}
          </span>
        )}
      </div>

      <Tabs scrollable className="sticky top-[62px] z-10">
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

      <div className="min-h-[50vh] px-5 pt-4 pb-24 bg-gray-50">
        {filteredProducts.length === 0 ? (
          <div className="flex w-full py-10 justify-center items-center">
            <span className="text-sm text-gray-500">등록된 상품이 없습니다.</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-2.5 gap-y-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Content>
  );
}

function StoreLogo({
  name,
  profileImage,
}: {
  name: string;
  profileImage: string | null;
}) {
  const { imageError, imageRef, onError } = useImageError();
  const className =
    "size-16 shrink-0 rounded-full border-[3px] border-white shadow-[0_4px_10px_rgba(15,33,56,0.15)]";

  return profileImage && !imageError ? (
    <img
      src={profileImage}
      alt={name}
      className={cn(className, "object-contain bg-gray-100")}
      ref={imageRef}
          onError={onError}
    />
  ) : (
    <div className={cn(className, "flex items-center justify-center bg-navy-100")}>
      <span className="text-lg font-bold text-primary">{name.charAt(0)}</span>
    </div>
  );
}
