import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 사용자의 장바구니 목록 조회
 * - 장바구니 정보
 * - SKU 정보 (옵션, 가격)
 * - 상품 기본 정보 (이름, 이미지)
 * - 판매자 정보
 */
export const getCartItems = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("carts")
    .select(
      `
      id,
      sku_id,
      quantity,
      created_at,
      updated_at,
      product_stock_keepings!inner (
        id,
        sku_code,
        options,
        regular_price,
        sale_price,
        stock,
        status,
        product_id,
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
          product_deliveries!product_deliveries_product_id_products_id_fk (
            shipping_fee_type,
            shipping_fee,
            free_shipping_condition
          )
        )
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((item) => {
    const sku = item.product_stock_keepings;
    const product = sku.products;
    const mainImage = product.product_images.find((img) => img.type === "MAIN");

    return {
      id: item.id,
      skuId: item.sku_id,
      quantity: item.quantity,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      // SKU 정보
      sku: {
        id: sku.id,
        skuCode: sku.sku_code,
        options: sku.options as Record<string, string> | null,
        regularPrice: sku.regular_price ?? 0,
        salePrice: sku.sale_price ?? 0,
        stock: sku.stock,
        status: sku.status,
      },
      // 상품 정보
      product: {
        id: product.id,
        productCode: product.product_code,
        name: product.name,
        mainImage: mainImage?.url ?? null,
      },
      // 판매자 정보
      seller: product.admin_sellers
        ? {
            id: product.admin_sellers.id,
            name: product.admin_sellers.name,
            sellerCode: product.admin_sellers.seller_code,
          }
        : null,
      // 배송 정보
      delivery: product.product_deliveries[0]
        ? {
            shippingFeeType: product.product_deliveries[0].shipping_fee_type,
            shippingFee: product.product_deliveries[0].shipping_fee,
            freeShippingCondition: product.product_deliveries[0].free_shipping_condition,
          }
        : null,
    };
  });
};

export type CartItem = Awaited<ReturnType<typeof getCartItems>>[number];

/**
 * 장바구니 상품 개수 조회
 */
export const getCartCount = async (client: Client, userId: string) => {
  const { count, error } = await client
    .from("carts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
};
