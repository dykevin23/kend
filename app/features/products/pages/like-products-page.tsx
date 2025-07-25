import SubHeader from "~/common/components/sub-header";
import ProductCard from "../components/product-card";
import type { Route } from "./+types/like-products-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getLikeProducts } from "../queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const products = await getLikeProducts(client);
  return { products };
};

export default function LikeProductsPage({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <SubHeader title="좋아요" />
      <div className="flex w-full flex-col gap-6 pb-10">
        {loaderData.products.map((product) => (
          <ProductCard
            key={product.product_id}
            id={product.product_id}
            title={product.name}
            distance="2.1km 이내"
            postedAt={product.updated_at}
            price={product.price}
            available="9개월 사용가능"
            messagesCount={product.chats}
            likesCount={product.likes}
            image={product.product_image}
          />
        ))}
      </div>
    </div>
  );
}
