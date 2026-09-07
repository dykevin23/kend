import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 사용자가 특정 상품을 좋아요 했는지 확인
 */
export const isProductLiked = async (
  client: Client,
  userId: string,
  productId: string
) => {
  const { data, error } = await client
    .from("product_likes")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

/**
 * 상품의 좋아요 수 조회
 */
export const getProductLikeCount = async (client: Client, productId: string) => {
  const { count, error } = await client
    .from("product_likes")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (error) throw error;
  return count ?? 0;
};

/**
 * 사용자의 좋아요한 상품 목록 조회
 */
export const getLikedProducts = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("product_likes")
    .select(
      `
      product_id,
      created_at,
      products!inner (
        id,
        product_code,
        name,
        seller_id,
        admin_sellers!products_seller_id_admin_sellers_id_fk (
          id,
          name,
          seller_code
        ),
        product_images!product_images_product_id_products_id_fk (
          id,
          url,
          type
        ),
        product_stock_keepings!product_stock_keepings_product_id_products_id_fk (
          regular_price,
          sale_price,
          status
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((item) => {
    const product = item.products;
    const mainImage = product.product_images.find((img) => img.type === "MAIN");

    // 사용 가능한 SKU 중 최저가
    const availableSkus = product.product_stock_keepings.filter(
      (sku) => sku.status !== "REGISTERED"
    );
    const lowestPriceSku = availableSkus.sort(
      (a, b) => (a.sale_price ?? 0) - (b.sale_price ?? 0)
    )[0];

    const regularPrice = lowestPriceSku?.regular_price ?? 0;
    const salePrice = lowestPriceSku?.sale_price ?? 0;
    const discountRate =
      regularPrice > 0
        ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
        : 0;

    return {
      productId: item.product_id,
      likedAt: item.created_at,
      product: {
        id: product.id,
        productCode: product.product_code,
        name: product.name,
        mainImage: mainImage?.url ?? null,
        regularPrice,
        salePrice,
        discountRate,
      },
      seller: product.admin_sellers
        ? {
            id: product.admin_sellers.id,
            name: product.admin_sellers.name,
            sellerCode: product.admin_sellers.seller_code,
          }
        : null,
    };
  });
};

export type LikedProduct = Awaited<ReturnType<typeof getLikedProducts>>[number];

/**
 * 사용자가 특정 스토어를 찜 했는지 확인
 */
export const isStoreLiked = async (
  client: Client,
  userId: string,
  sellerId: string
) => {
  const { data, error } = await client
    .from("store_likes")
    .select("seller_id")
    .eq("user_id", userId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

/**
 * 사용자의 찜한 스토어 목록 조회
 */
export const getLikedStores = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("store_likes")
    .select(
      `
      seller_id,
      created_at,
      admin_sellers!store_likes_seller_id_admin_sellers_id_fk (
        id,
        seller_code,
        name
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((item) => {
    const {
      data: { publicUrl: logoUrl },
    } = client.storage
      .from("sellers")
      .getPublicUrl(`${item.admin_sellers.seller_code}/logo`);

    return {
      sellerId: item.seller_id,
      likedAt: item.created_at,
      store: {
        id: item.admin_sellers.id,
        sellerCode: item.admin_sellers.seller_code,
        name: item.admin_sellers.name,
        profileImage: logoUrl,
      },
    };
  });
};

export type LikedStore = Awaited<ReturnType<typeof getLikedStores>>[number];
