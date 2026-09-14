import type { Database } from "~/supa-client";

export type SalesStatus = Database["public"]["Enums"]["sales_status"];

/**
 * 상품 / SKU 상태 모델 — kend 구현 대상 (readme/todo/product-sku-status-model.md §3)
 *
 * 핵심 원칙: "탐색"에서만 상태로 거르고, "참조"에서는 절대 사라지지 않는다.
 * 이 모듈은 그 판정 로직을 한 곳에 모아, queries/컴포넌트 여러 곳에서
 * `status === 'SALE' && stock > 0` 같은 조건을 중복 구현하지 않도록 한다.
 */

interface SkuLike {
  status: SalesStatus | null;
  stock: number;
}

/** 이 SKU를 지금 주문할 수 있는가 (상품 상태는 별도 확인 필요) */
export const isSkuPurchasable = (sku: SkuLike): boolean =>
  sku.status === "SALE" && sku.stock > 0;

/** 상품이 탐색(목록/검색/추천) 화면에 뜰 자격이 있는가 */
export const isProductDiscoverable = (
  productStatus: SalesStatus | null,
  skus: SkuLike[]
): boolean => productStatus === "SALE" && skus.some(isSkuPurchasable);

/** 특정 SKU를 지금 주문할 수 있는가 (상품 상태 + SKU 상태 + 재고 전부 확인) */
export const isSkuOrderable = (
  productStatus: SalesStatus | null,
  sku: SkuLike
): boolean => productStatus === "SALE" && isSkuPurchasable(sku);

export type PurchaseBlockReason = {
  /** 상태 배지/안내에 쓰는 문구 (§3 "상태별 문구" 표) */
  label: string;
};

/**
 * 지금 이 상품을 구매할 수 없는 이유. 구매 가능하면 null.
 * 상세페이지 구매버튼, 장바구니 항목 배지 등 "참조" 화면에서 사용.
 */
export const getPurchaseBlockReason = (
  productStatus: SalesStatus | null,
  skus: SkuLike[]
): PurchaseBlockReason | null => {
  if (productStatus === "PREPARE") return { label: "판매 준비 중" };
  if (productStatus === "STOP") return { label: "판매 중지된 상품입니다" };
  if (productStatus === "END") return { label: "판매 종료된 상품입니다" };
  if (productStatus === "SALE") {
    // 상품은 판매중인데 구매 가능한 SKU가 하나도 없음 → 일시 품절
    if (!skus.some(isSkuPurchasable)) return { label: "일시 품절" };
    return null;
  }
  // REGISTERED 등 그 외 — 탐색에는 애초에 안 뜨지만 참조(URL 직접 접근 등)로는
  // 들어올 수 있으므로 안전하게 구매불가 처리
  return { label: "구매할 수 없는 상품입니다" };
};

/**
 * 이 SKU(장바구니 한 줄, 옵션 값 등)를 지금 구매할 수 없는 이유의 짧은 라벨.
 * 구매 가능하면 null. §3 "상태별 문구" 표 중 "일부 옵션만 불가" 행 대응.
 */
export const getSkuUnavailableLabel = (
  productStatus: SalesStatus | null,
  sku: SkuLike
): string | null => {
  if (isSkuOrderable(productStatus, sku)) return null;
  // 상품 자체가 판매중이 아니면 상품 레벨 사유가 우선
  if (productStatus !== "SALE") {
    return getPurchaseBlockReason(productStatus, [sku])?.label ?? "구매할 수 없는 상품입니다";
  }
  // 상품은 SALE인데 이 SKU만 불가 — 사유를 뭉치지 말고 구체적으로
  return sku.status === "STOP" ? "판매중지" : "품절";
};

export type SkuOptionState = "available" | "soldout" | "stopped";

/** 상세페이지 옵션 선택 UI에서 이 SKU(옵션 조합)를 어떻게 보여줄지 */
export const getSkuOptionState = (sku: SkuLike): SkuOptionState => {
  if (sku.status === "STOP") return "stopped";
  if (sku.status === "SOLD_OUT" || sku.stock <= 0) return "soldout";
  return "available";
};
