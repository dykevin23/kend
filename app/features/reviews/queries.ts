import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 사용자가 이미 리뷰를 작성한 구매확정 건(delivery_item) 목록 — 리뷰 ID 포함
 * "이미 작성했는지" 판단 + "그 리뷰 보기" 링크 구성에 함께 사용
 */
export const getReviewedDeliveryItems = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("reviews")
    .select("id, delivery_item_id")
    .eq("user_id", userId);

  if (error) throw error;
  return data.map((r) => ({ deliveryItemId: r.delivery_item_id, reviewId: r.id }));
};

export type ReviewedDeliveryItem = Awaited<
  ReturnType<typeof getReviewedDeliveryItems>
>[number];

/**
 * 상품 리뷰 목록 조회 (최신순)
 */
export const getProductReviews = async (client: Client, productId: string) => {
  const { data, error } = await client
    .from("reviews")
    .select(
      `
      id,
      rating,
      content,
      created_at,
      seller_reply,
      seller_replied_at,
      profiles!reviews_user_id_profiles_profile_id_fk ( nickname ),
      review_images!review_images_review_id_reviews_id_fk ( url )
    `
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((review) => ({
    id: review.id,
    rating: review.rating,
    content: review.content,
    createdAt: review.created_at,
    nickname: review.profiles?.nickname ?? "탈퇴한 회원",
    imageUrls: review.review_images.map((img) => img.url),
    sellerReply: review.seller_reply,
    sellerRepliedAt: review.seller_replied_at,
  }));
};

export type ProductReview = Awaited<ReturnType<typeof getProductReviews>>[number];

/**
 * 사용자가 작성한 리뷰 목록 조회 (마이페이지 "내가 쓴 리뷰", 최신순)
 */
export const getUserReviews = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("reviews")
    .select(
      `
      id,
      rating,
      content,
      created_at,
      seller_reply,
      seller_replied_at,
      products!reviews_product_id_products_id_fk (
        id,
        product_code,
        name,
        product_images!product_images_product_id_products_id_fk ( url, type )
      ),
      review_images!review_images_review_id_reviews_id_fk ( url ),
      delivery_items!reviews_delivery_item_id_delivery_items_id_fk (
        order_items!delivery_items_order_item_id_order_items_id_fk (
          options,
          sale_price
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((review) => {
    const mainImage = review.products.product_images.find(
      (img) => img.type === "MAIN"
    );
    return {
      id: review.id,
      rating: review.rating,
      content: review.content,
      createdAt: review.created_at,
      imageUrls: review.review_images.map((img) => img.url),
      sellerReply: review.seller_reply,
      sellerRepliedAt: review.seller_replied_at,
      product: {
        id: review.products.id,
        productCode: review.products.product_code,
        name: review.products.name,
        mainImage: mainImage?.url ?? null,
        options: review.delivery_items.order_items.options as Record<
          string,
          string
        > | null,
        salePrice: review.delivery_items.order_items.sale_price,
      },
    };
  });
};

export type UserReview = Awaited<ReturnType<typeof getUserReviews>>[number];

/**
 * 사용자가 작성한 리뷰 개수 (마이페이지 퀵메뉴 카운트용)
 */
export const getUserReviewCount = async (client: Client, userId: string) => {
  const { count, error } = await client
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
};

/**
 * 상품 평점 요약 (평균, 개수) — 리뷰가 없으면 0
 */
export const getProductRatingSummary = async (client: Client, productId: string) => {
  const { data, error } = await client
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error) throw error;

  if (data.length === 0) {
    return { average: 0, count: 0 };
  }

  const total = data.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: Math.round((total / data.length) * 10) / 10,
    count: data.length,
  };
};
