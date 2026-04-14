import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 상품명 검색 (단순 LIKE 검색)
 */
export const searchProductsByName = async (client: Client, query: string) => {
  const trimmed = query.trim();
  if (!trimmed) return [];

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
    .ilike("name", `%${trimmed}%`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  const available = data.filter((product) =>
    product.product_stock_keepings.some((sku) => sku.status !== "REGISTERED")
  );

  return available.map((product) => {
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

export type SearchProduct = Awaited<
  ReturnType<typeof searchProductsByName>
>[number];
