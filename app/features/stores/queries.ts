import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 도메인 목록 조회 (use_yn = 'Y')
 */
export const getDomains = async (client: Client) => {
  const { data, error } = await client
    .from("domains")
    .select("id, code, name")
    .eq("use_yn", "Y")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data.map((domain) => ({
    id: domain.id,
    code: domain.code,
    name: domain.name,
  }));
};

export type Domain = Awaited<ReturnType<typeof getDomains>>[number];

/**
 * 메인 카테고리 목록 조회 (by domain_id)
 */
export const getMainCategories = async (client: Client, domainId?: string) => {
  let query = client
    .from("main_categories")
    .select("id, code, name, domain_id")
    .order("created_at", { ascending: true });

  if (domainId) {
    query = query.eq("domain_id", domainId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.map((category) => ({
    id: category.id,
    code: category.code,
    name: category.name,
    domainId: category.domain_id,
  }));
};

export type MainCategory = Awaited<ReturnType<typeof getMainCategories>>[number];

/**
 * 스토어 목록 조회 (대표 상품 이미지 포함)
 * - 판매 가능한 상품의 대표이미지를 최대 6개까지 가져옴
 * - 상품: REGISTERED 상태 제외
 * - SKU: REGISTERED 상태가 아닌 SKU가 하나라도 있어야 노출
 */
export const getStoresWithProducts = async (client: Client) => {
  const { data, error } = await client
    .from("admin_sellers")
    .select(
      `
      id,
      seller_code,
      name,
      domain_id,
      seller_hashtags!seller_hashtags_seller_id_admin_sellers_id_fk (
        hashtags!seller_hashtags_hashtag_id_hashtags_id_fk (
          name
        )
      ),
      products!products_seller_id_admin_sellers_id_fk (
        id,
        product_code,
        name,
        status,
        product_images!product_images_product_id_products_id_fk (
          url,
          type
        ),
        product_stock_keepings!product_stock_keepings_product_id_products_id_fk (
          status
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  // 데이터 가공: 각 스토어별로 대표 이미지만 추출
  return data.map((store) => {
    // 로고 URL: Storage sellers 버킷의 {seller_code}/logo 경로
    const {
      data: { publicUrl: logoUrl },
    } = client.storage
      .from("sellers")
      .getPublicUrl(`${store.seller_code}/logo`);

    // 해시태그: "#태그1 #태그2" 형식 (\u2060으로 #과 태그명 사이 줄바꿈 방지)
    const hashtags = store.seller_hashtags
      .map((sh) => `#\u2060${sh.hashtags.name}`)
      .join(" ");

    return {
      id: store.id,
      sellerCode: store.seller_code,
      name: store.name,
      domainId: store.domain_id,
      profileImage: logoUrl,
      hashtags: hashtags || null,
      followerCount: 0, // TODO: followers 테이블 구현 후 교체
      // 판매 가능한 상품의 대표이미지만 추출 (최대 6개)
      productImages: store.products
        .filter((p) => {
          // 상품이 REGISTERED 상태면 제외
          if (p.status === "REGISTERED") return false;
          // SKU 중 REGISTERED가 아닌 것이 하나라도 있어야 함
          const hasAvailableSku = p.product_stock_keepings.some(
            (sku) => sku.status !== "REGISTERED"
          );
          return hasAvailableSku;
        })
        .flatMap((p) =>
          p.product_images
            .filter((img) => img.type === "MAIN")
            .map((img) => img.url)
        )
        .slice(0, 6),
    };
  });
};

export type StoreWithProducts = Awaited<
  ReturnType<typeof getStoresWithProducts>
>[number];

/**
 * 개별 스토어 조회 (by seller_code)
 */
export const getStoreByCode = async (client: Client, sellerCode: string) => {
  const { data, error } = await client
    .from("admin_sellers")
    .select(
      `
      id,
      seller_code,
      name,
      domain_id,
      seller_hashtags!seller_hashtags_seller_id_admin_sellers_id_fk (
        hashtags!seller_hashtags_hashtag_id_hashtags_id_fk (
          name
        )
      )
    `
    )
    .eq("seller_code", sellerCode)
    .single();

  if (error) throw error;

  // 로고 URL: Storage sellers 버킷의 {seller_code}/logo 경로
  const {
    data: { publicUrl: logoUrl },
  } = client.storage
    .from("sellers")
    .getPublicUrl(`${data.seller_code}/logo`);

  // 해시태그: "#태그1 #태그2" 형식 (\u2060으로 #과 태그명 사이 줄바꿈 방지)
  const hashtags = data.seller_hashtags
    .map((sh) => `#\u2060${sh.hashtags.name}`)
    .join(" ");

  return {
    id: data.id,
    sellerCode: data.seller_code,
    name: data.name,
    domainId: data.domain_id,
    profileImage: logoUrl,
    hashtags: hashtags || null,
    followerCount: 0, // TODO: followers 테이블 구현 후 교체
  };
};

export type Store = Awaited<ReturnType<typeof getStoreByCode>>;

/**
 * 특정 스토어의 상품 목록 조회
 * - 상품: REGISTERED 상태 제외
 * - SKU: REGISTERED 상태가 아닌 SKU가 하나라도 있어야 노출
 */
export const getProductsBySeller = async (
  client: Client,
  sellerId: string,
  options?: {
    limit?: number;
  }
) => {
  let query = client
    .from("products")
    .select(
      `
      id,
      product_code,
      name,
      status,
      main_category,
      sub_category,
      product_images!product_images_product_id_products_id_fk (
        url,
        type
      ),
      product_stock_keepings!product_stock_keepings_product_id_products_id_fk (
        regular_price,
        sale_price,
        stock,
        status
      )
    `
    )
    .eq("seller_id", sellerId)
    .neq("status", "REGISTERED") // REGISTERED 상태 제외
    .order("created_at", { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;

  // SKU 중 REGISTERED가 아닌 것이 하나라도 있는 상품만 필터링
  const filteredProducts = data.filter((product) => {
    const hasAvailableSku = product.product_stock_keepings.some(
      (sku) => sku.status !== "REGISTERED"
    );
    return hasAvailableSku;
  });

  return filteredProducts.map((product) => {
    const mainImage = product.product_images.find((img) => img.type === "MAIN");
    // SKU 중 REGISTERED가 아닌 것들 중 최저가
    const availableSkus = product.product_stock_keepings
      .filter((sku) => sku.status !== "REGISTERED" && sku.stock > 0)
      .sort((a, b) => (a.sale_price ?? 0) - (b.sale_price ?? 0));

    const activeSku = availableSkus[0];

    const regularPrice = activeSku?.regular_price ?? 0;
    const salePrice = activeSku?.sale_price ?? 0;
    const discountRate =
      regularPrice > 0
        ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
        : 0;

    return {
      id: product.id,
      productCode: product.product_code,
      name: product.name,
      mainCategory: product.main_category,
      mainImage: mainImage?.url ?? null,
      regularPrice,
      salePrice,
      discountRate,
    };
  });
};

export type ProductListItem = Awaited<
  ReturnType<typeof getProductsBySeller>
>[number];

/**
 * 무작위 배너 조회 (스토어 목록용)
 * - 모든 판매자의 활성 배너 중 무작위 최대 5개
 */
export const getRandomBanners = async (client: Client, limit = 5) => {
  const { data, error } = await client
    .from("seller_banners")
    .select("id, image_url")
    .eq("is_active", true);

  if (error) throw error;

  const shuffled = data.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map((b) => b.image_url);
};

/**
 * 특정 판매자 배너 조회 (스토어 상세용)
 * - is_active = true, display_order 오름차순, 최대 5개
 */
export const getSellerBanners = async (
  client: Client,
  sellerId: string,
  limit = 5
) => {
  const { data, error } = await client
    .from("seller_banners")
    .select("id, image_url")
    .eq("seller_id", sellerId)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data.map((b) => b.image_url);
};
