/**
 * 배송비 타입
 */
export type ShippingFeeType = "FREE" | "PAID" | "COD" | "CONDITIONAL";

/**
 * 배송 정보
 */
export interface DeliveryInfo {
  shippingFeeType: ShippingFeeType;
  shippingFee: number;
  freeShippingCondition: number | null;
}

/**
 * 결제 모달에서 사용하는 주문 아이템 타입
 * 장바구니 페이지, 상품 페이지 모두에서 공통으로 사용
 */
export interface OrderItem {
  skuId: string;
  quantity: number;
  sku: {
    skuCode: string;
    options: Record<string, string> | null;
    regularPrice: number;
    salePrice: number;
  };
  product: {
    id: string;
    productCode: string;
    name: string;
    mainImage: string | null;
  };
  seller: {
    id: string;
    name: string;
    sellerCode: string;
  } | null;
  delivery: DeliveryInfo | null;
}

/**
 * 판매자별로 그룹핑된 주문 아이템
 */
export interface SellerOrderGroup {
  seller: {
    id: string;
    name: string;
    sellerCode: string;
  } | null;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
}

/**
 * 배송비 계산
 * - FREE: 무료배송
 * - PAID: 고정 배송비
 * - COD: 착불 (결제 금액에서 제외, UI에서 "착불"로 표시)
 * - CONDITIONAL: 조건부 무료 (금액 조건 충족 시 무료, 미충족 시 배송비 부과)
 */
function calculateShippingFee(
  delivery: DeliveryInfo | null,
  subtotal: number
): number {
  if (!delivery) return 0;

  switch (delivery.shippingFeeType) {
    case "FREE":
      return 0;
    case "PAID":
      return delivery.shippingFee;
    case "COD":
      // 착불은 결제 금액에 포함되지 않음
      return 0;
    case "CONDITIONAL":
      // 조건부 무료: 주문 금액이 조건 이상이면 무료
      if (
        delivery.freeShippingCondition !== null &&
        subtotal >= delivery.freeShippingCondition
      ) {
        return 0;
      }
      return delivery.shippingFee;
    default:
      return 0;
  }
}

/**
 * OrderItem 배열을 판매자별로 그룹핑
 */
export function groupOrderItemsBySeller(items: OrderItem[]): SellerOrderGroup[] {
  const sellerMap = new Map<string, SellerOrderGroup>();

  items.forEach((item) => {
    const sellerId = item.seller?.id ?? "unknown";

    if (!sellerMap.has(sellerId)) {
      sellerMap.set(sellerId, {
        seller: item.seller,
        items: [],
        itemCount: 0,
        subtotal: 0,
        shippingFee: 0,
      });
    }

    const group = sellerMap.get(sellerId)!;
    group.items.push(item);
    group.itemCount += item.quantity;
    group.subtotal += item.sku.salePrice * item.quantity;
  });

  // 각 그룹의 배송비 계산 (첫 번째 아이템의 배송 정책 사용)
  sellerMap.forEach((group) => {
    const firstItemDelivery = group.items[0]?.delivery ?? null;
    group.shippingFee = calculateShippingFee(firstItemDelivery, group.subtotal);
  });

  return Array.from(sellerMap.values());
}

/**
 * CartItem을 OrderItem으로 변환
 */
export function cartItemToOrderItem(cartItem: {
  skuId: string;
  quantity: number;
  sku: {
    skuCode: string;
    options: Record<string, string> | null;
    regularPrice: number;
    salePrice: number;
  };
  product: {
    id: string;
    productCode: string;
    name: string;
    mainImage: string | null;
  };
  seller: {
    id: string;
    name: string;
    sellerCode: string;
  } | null;
  delivery: DeliveryInfo | null;
}): OrderItem {
  return {
    skuId: cartItem.skuId,
    quantity: cartItem.quantity,
    sku: {
      skuCode: cartItem.sku.skuCode,
      options: cartItem.sku.options,
      regularPrice: cartItem.sku.regularPrice,
      salePrice: cartItem.sku.salePrice,
    },
    product: {
      id: cartItem.product.id,
      productCode: cartItem.product.productCode,
      name: cartItem.product.name,
      mainImage: cartItem.product.mainImage,
    },
    seller: cartItem.seller,
    delivery: cartItem.delivery,
  };
}
