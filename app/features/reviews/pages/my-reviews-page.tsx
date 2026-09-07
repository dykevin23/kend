import { DateTime } from "luxon";
import { Link, redirect, useLoaderData } from "react-router";
import Content from "~/common/components/content";
import StarRating from "~/common/components/star-rating";
import { makeSSRClient } from "~/supa-client";
import { getUserReviews } from "../queries";
import type { Route } from "./+types/my-reviews-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login", { headers });
  }

  const url = new URL(request.url);
  const reviewId = url.searchParams.get("reviewId");

  const allReviews = await getUserReviews(client, user.id);
  const reviews = reviewId
    ? allReviews.filter((review) => review.id === reviewId)
    : allReviews;

  return { reviews, isFiltered: !!reviewId };
};

export default function MyReviewsPage() {
  const { reviews, isFiltered } = useLoaderData<typeof loader>();

  return (
    <Content
      headerPorps={{ title: isFiltered ? "리뷰 보기" : "내가 쓴 리뷰", useRight: false }}
    >
      {reviews.length === 0 ? (
        <div className="flex w-full py-20 justify-center items-center">
          <span className="text-muted">아직 작성한 리뷰가 없어요</span>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {reviews.map((review) => (
            <Link
              key={review.id}
              to={`/products/${review.product.productCode}`}
              prefetch="intent"
              className="flex flex-col gap-2 px-4 py-4 border-b border-muted/20"
            >
              <div className="flex items-center gap-3">
                {review.product.mainImage ? (
                  <img
                    src={review.product.mainImage}
                    alt={review.product.name}
                    className="size-12 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="size-12 shrink-0 rounded-md bg-gray-200" />
                )}
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="truncate text-sm font-medium">
                    {review.product.name}
                  </span>
                  {review.product.options && (
                    <span className="text-xs text-muted/50 truncate">
                      {Object.values(review.product.options).join(" / ")}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-900">
                    {review.product.salePrice.toLocaleString()}원
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <StarRating score={review.rating} />
                <span className="text-xs text-muted/50 whitespace-nowrap">
                  {DateTime.fromISO(review.createdAt).toFormat("yy.MM.dd")}
                </span>
              </div>
              <p className="text-sm leading-[150%] line-clamp-3 whitespace-pre-line">
                {review.content}
              </p>
              {review.imageUrls.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {review.imageUrls.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt="리뷰 사진"
                      className="size-16 shrink-0 rounded-md object-cover"
                    />
                  ))}
                </div>
              )}
              {review.sellerReply && (
                <div className="flex flex-col gap-1 px-2.5 py-2 ml-4 rounded-md bg-muted/10">
                  <span className="text-xs font-bold text-secondary">판매자 답변</span>
                  <span className="text-xs leading-[150%] whitespace-pre-line">
                    {review.sellerReply}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </Content>
  );
}
