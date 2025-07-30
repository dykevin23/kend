import SubHeader from "~/common/components/sub-header";
import Profile from "../components/profile";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/user-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId, getProfileByUserId } from "../queries";
import { getProductsByUserId } from "~/features/products/queries";
import UserProductCard from "../components/user-product-card";
import { useState } from "react";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const profile = await getProfileByUserId(client, { userId: params.userId });
  const products = await getProductsByUserId(client, { userId });

  const salesProducts = products.filter((item) => item.status === "sales");
  const doneProducts = products.filter((item) => item.status === "done");
  return {
    profile,
    salesProducts,
    doneProducts,
  };
};

export default function UserPage({ loaderData }: Route.ComponentProps) {
  const [tabKey, setTabKey] = useState<"ongoing" | "done">("ongoing");

  return (
    <div>
      <SubHeader title={loaderData.profile.nickname} />

      <Profile
        profileId={loaderData.profile.profile_id}
        nickname={loaderData.profile.nickname}
        avatar={loaderData.profile.avatar}
        introduction={loaderData.profile.introduction}
        comment={loaderData.profile.comment}
        followers={loaderData.profile.followers}
        following={loaderData.profile.following}
        isFollowing={loaderData.profile.is_following}
        productsCount={
          loaderData.salesProducts.length + loaderData.doneProducts.length
        }
      />

      <div className="flex flex-col w-full items-start gap-6">
        <div className="flex items-center self-stretch">
          <div
            className={cn([
              "flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0 text-base font-semibold",
              tabKey === "ongoing"
                ? "border-b-2 border-primary"
                : "text-muted-foreground",
            ])}
            onClick={() => setTabKey("ongoing")}
          >
            <span>판매중</span>
            <span>{loaderData.salesProducts.length}</span>
          </div>

          <div
            className={cn([
              "flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0 text-base font-semibold",
              tabKey === "done"
                ? "border-b-2 border-primary"
                : "text-muted-foreground",
            ])}
            onClick={() => setTabKey("done")}
          >
            <span>판매완료</span>
            <span>{loaderData.doneProducts.length}</span>
          </div>
        </div>

        <div className="flex px-4 items-start gap-4 self-stretch">
          {(tabKey === "ongoing"
            ? loaderData.salesProducts
            : loaderData.doneProducts
          ).map((product) => (
            <UserProductCard
              key={product.product_id}
              id={product.product_id}
              title={product.name}
              postedAt={product.updated_at}
              price={product.price}
              status={tabKey}
              isMe={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
