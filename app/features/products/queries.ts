import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 상품 상세 조회 (by product_code)
 * - 상품 기본 정보
 * - 이미지 (메인 + 추가)
 * - SKU 정보 (가격, 옵션)
 * - 상세 설명 (description)
 * - 상품 상세 (브랜드, 제조사)
 */
export const getProductByCode = async (client: Client, productCode: string) => {
  const { data, error } = await client
    .from("products")
    .select(
      `
      id,
      product_code,
      name,
      status,
      domain_id,
      main_category,
      sub_category,
      target_age,
      target_gender,
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
        id,
        sku_code,
        options,
        regular_price,
        sale_price,
        stock,
        status
      ),
      product_descriptions!product_descriptions_product_id_products_id_fk (
        id,
        type,
        content
      ),
      product_details!product_details_product_id_products_id_fk (
        id,
        brand,
        maker
      ),
      product_deliveries!product_deliveries_product_id_products_id_fk (
        shipping_fee_type,
        shipping_fee,
        free_shipping_condition
      )
    `
    )
    .eq("product_code", productCode)
    .single();

  if (error) throw error;

  // 도메인의 system_options 조회 (옵션 코드 -> 이름 매핑용)
  const optionCodeToName: Record<string, string> = {};
  if (data.domain_id) {
    const { data: systemOptions } = await client
      .from("system_options")
      .select("id, code, name")
      .eq("domain_id", data.domain_id);

    systemOptions?.forEach((opt) => {
      optionCodeToName[opt.code] = opt.name;
    });
  }

  // 이미지 분류
  const mainImage = data.product_images.find((img) => img.type === "MAIN");
  const additionalImages = data.product_images.filter(
    (img) => img.type === "ADDITIONAL"
  );
  const allImages = mainImage
    ? [mainImage, ...additionalImages]
    : additionalImages;

  // 사용 가능한 SKU (REGISTERED 제외, 재고 있음)
  const availableSkus = data.product_stock_keepings
    .filter((sku) => sku.status !== "REGISTERED" && sku.stock > 0)
    .sort((a, b) => (a.sale_price ?? 0) - (b.sale_price ?? 0));

  const lowestPriceSku = availableSkus[0];
  const regularPrice = lowestPriceSku?.regular_price ?? 0;
  const salePrice = lowestPriceSku?.sale_price ?? 0;
  const discountRate =
    regularPrice > 0
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  // Description (이미지 타입) - 각 레코드의 content가 단일 URL
  const descriptionImages = data.product_descriptions
    .filter((desc) => desc.type === "IMAGE" && desc.content)
    .map((desc) => desc.content as string);

  // 상품 상세 정보
  const productDetail = data.product_details[0];

  return {
    id: data.id,
    productCode: data.product_code,
    name: data.name,
    status: data.status,
    domainId: data.domain_id,
    mainCategory: data.main_category,
    subCategory: data.sub_category,
    targetAge: data.target_age,
    targetGender: data.target_gender,
    // 판매자 정보
    seller: data.admin_sellers
      ? {
          id: data.admin_sellers.id,
          name: data.admin_sellers.name,
          sellerCode: data.admin_sellers.seller_code,
        }
      : null,
    // 이미지
    images: allImages.map((img) => ({
      id: img.id,
      url: img.url,
      type: img.type,
    })),
    // 가격 정보
    regularPrice,
    salePrice,
    discountRate,
    // SKU 목록 (옵션 선택용)
    skus: data.product_stock_keepings
      .filter((sku) => sku.status !== "REGISTERED")
      .map((sku) => ({
        id: sku.id,
        skuCode: sku.sku_code,
        options: sku.options as Record<string, string> | null,
        regularPrice: sku.regular_price ?? 0,
        salePrice: sku.sale_price ?? 0,
        stock: sku.stock,
        status: sku.status,
      })),
    // 상세 설명 이미지
    descriptionImages,
    // 브랜드/제조사
    brand: productDetail?.brand ?? null,
    maker: productDetail?.maker ?? null,
    // 옵션 코드 -> 이름 매핑
    optionCodeToName,
    // 배송 정보
    delivery: data.product_deliveries[0]
      ? {
          shippingFeeType: data.product_deliveries[0].shipping_fee_type,
          shippingFee: data.product_deliveries[0].shipping_fee,
          freeShippingCondition: data.product_deliveries[0].free_shipping_condition,
        }
      : null,
  };
};

export type ProductDetail = Awaited<ReturnType<typeof getProductByCode>>;

/**
 * 랜덤 상품 조회 (추천 상품 영역용)
 * - 판매 가능한 상품 중 랜덤으로 N개 반환
 */
export const getRandomProducts = async (client: Client, limit = 10) => {
  const { data, error } = await client
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
    .neq("status", "REGISTERED")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const available = data.filter((product) =>
    product.product_stock_keepings.some((sku) => sku.status !== "REGISTERED")
  );

  const shuffled = available.sort(() => Math.random() - 0.5).slice(0, limit);

  return shuffled.map((product) => {
    const mainImage = product.product_images.find((img) => img.type === "MAIN");
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

export type RandomProduct = Awaited<ReturnType<typeof getRandomProducts>>[number];
