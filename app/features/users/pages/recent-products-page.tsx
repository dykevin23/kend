import { Package } from "lucide-react";
import { redirect, useLoaderData } from "react-router";
import Content from "~/common/components/content";
import LikeProductCard from "~/features/likes/components/like-product-card";
import { getRecentlyViewedProducts } from "~/features/products/queries";
import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/recent-products-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login", { headers });
  }

  const recentProducts = await getRecentlyViewedProducts(client, user.id);
  return { recentProducts };
};

export default function RecentProductsPage() {
  const { recentProducts } = useLoaderData<typeof loader>();

  if (recentProducts.length === 0) {
    return (
      <Content headerPorps={{ title: "최근 본 상품", useRight: false }}>
        <div className="flex flex-col items-center justify-center w-full py-20 px-4 gap-3">
          <Package className="w-12 h-12 text-muted/40" />
          <span className="text-base font-medium text-muted">
            최근 본 상품이 없습니다
          </span>
          <span className="text-sm text-muted/60 text-center">
            상품을 둘러보고 관심 있는 상품을 확인해보세요.
          </span>
        </div>
      </Content>
    );
  }

  return (
    <Content headerPorps={{ title: "최근 본 상품", useRight: false }}>
      <div className="flex w-full flex-col items-start gap-4 mt-1 pb-20">
        {recentProducts.map((item) => (
          <LikeProductCard key={item.productId} item={item} />
        ))}
      </div>
    </Content>
  );
}
