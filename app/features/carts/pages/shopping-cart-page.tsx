import { useMemo, useState, useRef, useEffect } from "react";
import {
  redirect,
  useLoaderData,
  useFetcher,
  useSearchParams,
  Link,
  type ShouldRevalidateFunction,
} from "react-router";
import type { Route } from "./+types/shopping-cart-page";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Label } from "~/common/components/ui/label";
import CartProductCard from "../compoents/cart-product-card";
import RecommendProducts from "~/features/products/components/recommend-products";
import ProductPurchaseModal from "~/features/products/components/product-purchase-modal";
import { makeSSRClient } from "~/supa-client";
import { actionErrorResponse } from "~/lib/error-handler";
import { getCartItems, type CartItem } from "../queries";
import {
  removeFromCart,
  removeMultipleFromCart,
  updateCartQuantity,
} from "../mutations";
import {
  type OrderItem,
  cartItemToOrderItem,
  groupOrderItemsBySeller,
} from "~/features/orders/types";
import { getUserProfile, getDefaultAddress } from "~/features/users/queries";
import { isSkuOrderable } from "~/features/products/status";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { cartItems: [], profile: null, address: null };
  }

  const [cartItems, profile, address] = await Promise.all([
    getCartItems(client, user.id),
    getUserProfile(client, user.id),
    getDefaultAddress(client, user.id),
  ]);

  return { cartItems, profile, address };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client, headers } = makeSSRClient(request);
  const formData = await request.formData();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login", { headers });
  }

  const intent = formData.get("intent");

  try {
    if (intent === "updateQuantity") {
      const cartId = formData.get("cartId") as string;
      const quantity = Number(formData.get("quantity"));
      await updateCartQuantity(client, cartId, quantity);
      return { success: true };
    }

    if (intent === "remove") {
      const cartId = formData.get("cartId") as string;
      await removeFromCart(client, cartId);
      return { success: true };
    }

    if (intent === "removeSelected") {
      const cartIds = formData.getAll("cartIds") as string[];
      await removeMultipleFromCart(client, cartIds);
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    return actionErrorResponse(error);
  }
};

// 주문 생성(결제 시작) 직후엔 Toss 결제창으로 페이지를 떠나므로 이 loader를
// revalidate하지 않는다 — revalidation fetch가 페이지 이동으로 abort되면서
// ErrorBoundary가 잠깐 뜨는 문제 방지. (그 외 fetcher 제출은 정상 revalidate)
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formData,
  defaultShouldRevalidate,
}) => {
  if (formData?.get("intent") === "create") return false;
  return defaultShouldRevalidate;
};

export default function ShoppingCartPage() {
  const { cartItems, address } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  // 결제 후 안내 배너 — tone: 실패(error, 빨강) / 취소(cancelled, 회색)
  const [paymentBanner, setPaymentBanner] = useState<{
    tone: "error" | "cancelled";
    text: string;
  } | null>(null);

  // 구매 불가(품절/판매중지/상품상태) 항목은 기본 선택에서 제외
  const purchasableCartItems = cartItems.filter((item) =>
    isSkuOrderable(item.product.status, item.sku)
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(purchasableCartItems.map((item) => item.id)),
  );
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState<OrderItem[]>([]);
  const purchaseCartIdsRef = useRef<string[]>([]);

  // 결제 실패/취소 후 redirect로 넘어온 경우 안내 배너 표시
  useEffect(() => {
    const error = searchParams.get("payment_error");
    const cancelled = searchParams.get("payment_cancelled");
    if (!error && !cancelled) return;

    setPaymentBanner(
      error
        ? { tone: "error", text: error }
        : { tone: "cancelled", text: "결제가 취소되었습니다." },
    );

    const newParams = new URLSearchParams(searchParams);
    newParams.delete("payment_error");
    newParams.delete("payment_cancelled");
    setSearchParams(newParams, { replace: true });

    const timer = setTimeout(() => setPaymentBanner(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  const isAllSelected =
    purchasableCartItems.length > 0 &&
    selectedIds.size === purchasableCartItems.length;

  const handleCheckAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(purchasableCartItems.map((item) => item.id)));
    }
  };

  const handleCheckItem = (id: string, checked: boolean) => {
    // 구매 불가 항목은 체크 자체를 막음 (카드 쪽 체크박스도 disabled지만 방어적으로)
    const item = cartItems.find((i) => i.id === id);
    if (item && !isSkuOrderable(item.product.status, item.sku)) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleQuantityChange = (cartId: string, quantity: number) => {
    fetcher.submit(
      { intent: "updateQuantity", cartId, quantity: quantity.toString() },
      { method: "POST" },
    );
  };

  const handleRemove = (cartId: string) => {
    fetcher.submit({ intent: "remove", cartId }, { method: "POST" });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(cartId);
      return next;
    });
  };

  const handleRemoveSelected = () => {
    if (selectedIds.size === 0) return;
    const formData = new FormData();
    formData.append("intent", "removeSelected");
    selectedIds.forEach((id) => formData.append("cartIds", id));
    fetcher.submit(formData, { method: "POST" });
    setSelectedIds(new Set());
  };

  // 선택된 상품들의 총 금액 계산 — 결제 모달과 동일한 판매자별 그룹핑으로 배송비 계산
  const { totalProductPrice, totalPrice } = useMemo(() => {
    const selectedCartItems = cartItems.filter((item) => selectedIds.has(item.id));
    const productTotal = selectedCartItems.reduce(
      (sum, item) => sum + item.sku.salePrice * item.quantity,
      0
    );
    const sellerGroups = groupOrderItemsBySeller(
      selectedCartItems.map(cartItemToOrderItem)
    );
    const shippingFee = sellerGroups.reduce((sum, g) => sum + g.shippingFee, 0);
    return {
      totalProductPrice: productTotal,
      totalPrice: productTotal + shippingFee,
    };
  }, [cartItems, selectedIds]);

  const isUpdating = fetcher.state !== "idle";

  // 결제하기 버튼 클릭
  const handlePurchase = () => {
    if (selectedIds.size === 0) return;

    // 선택된 장바구니 아이템을 OrderItem으로 변환 (구매 불가 항목은 방어적으로 제외)
    const selectedCartItems = cartItems.filter(
      (item) => selectedIds.has(item.id) && isSkuOrderable(item.product.status, item.sku)
    );
    const orderItems = selectedCartItems.map(cartItemToOrderItem);

    // 주문 완료 후 삭제할 cart ID 저장
    purchaseCartIdsRef.current = selectedCartItems.map((item) => item.id);

    setPurchaseItems(orderItems);
    setIsPurchaseModalOpen(true);
  };

  // 화면 표시용 판매자별 묶음 (장바구니에 담긴 순서 유지)
  const sellerGroups = useMemo(() => {
    const groups = new Map<string, { name: string; items: CartItem[] }>();
    cartItems.forEach((item) => {
      const key = item.seller?.id ?? "unknown";
      const group = groups.get(key);
      if (group) group.items.push(item);
      else groups.set(key, { name: item.seller?.name ?? "판매자", items: [item] });
    });
    return Array.from(groups.entries());
  }, [cartItems]);

  const shippingFee = totalPrice - totalProductPrice;

  return (
    <Content
      headerPorps={{ title: "장바구니", useRight: false }}
      className="bg-gray-50"
      footer={
        cartItems.length > 0 && (
          <Button
            size="lg"
            className="w-full"
            disabled={selectedIds.size === 0}
            onClick={handlePurchase}
          >
            {selectedIds.size > 0
              ? `${totalPrice.toLocaleString()}원 결제하기`
              : "결제하기"}
          </Button>
        )
      }
    >
      {/* 결제 실패/취소 배너 */}
      {paymentBanner && (
        <div
          className={
            paymentBanner.tone === "error"
              ? "flex items-center gap-3 px-5 py-3 bg-red-50"
              : "flex items-center gap-3 px-5 py-3 bg-white"
          }
        >
          <span
            className={
              paymentBanner.tone === "error"
                ? "text-sm text-red-800"
                : "text-sm text-gray-700"
            }
          >
            {paymentBanner.text}
          </span>
          <button
            className={
              paymentBanner.tone === "error"
                ? "ml-auto text-red-600 text-xs shrink-0"
                : "ml-auto text-gray-500 text-xs shrink-0"
            }
            onClick={() => setPaymentBanner(null)}
          >
            닫기
          </button>
        </div>
      )}

      {cartItems.length > 0 ? (
        <>
          <div className="flex items-center justify-between px-5 py-[13px] bg-white">
            <div className="flex items-center gap-2">
              <Checkbox
                className="size-5"
                id="all"
                checked={isAllSelected}
                onCheckedChange={handleCheckAll}
              />
              <Label htmlFor="all" className="text-[13.5px] font-bold text-gray-900">
                전체선택 ({selectedIds.size}/{purchasableCartItems.length})
              </Label>
            </div>
            <button
              className="text-[13px] font-semibold text-gray-500 disabled:opacity-50"
              onClick={handleRemoveSelected}
              disabled={selectedIds.size === 0 || isUpdating}
            >
              선택삭제
            </button>
          </div>

          <div className="flex flex-col gap-[18px] px-5 py-4">
            {sellerGroups.map(([sellerId, group]) => (
              <div key={sellerId} className="flex flex-col gap-2.5">
                <span className="text-[13.5px] font-extrabold text-gray-900">
                  {group.name}
                </span>
                {group.items.map((item) => (
                  <CartProductCard
                    key={item.id}
                    item={item}
                    checked={selectedIds.has(item.id)}
                    onCheckChange={(checked) =>
                      handleCheckItem(item.id, checked as boolean)
                    }
                    onQuantityChange={(quantity) =>
                      handleQuantityChange(item.id, quantity)
                    }
                    onRemove={() => handleRemove(item.id)}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>
            ))}

            <div className="flex flex-col gap-2.5 p-[18px] bg-white rounded-card shadow-card-sm">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-700">상품금액</span>
                <span className="font-semibold text-gray-900">
                  {totalProductPrice.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-700">배송비</span>
                <span className="font-semibold text-gray-900">
                  {shippingFee > 0 ? `${shippingFee.toLocaleString()}원` : "무료"}
                </span>
              </div>
              <div className="h-px my-0.5 bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-[14.5px] font-extrabold text-gray-900">
                  총 결제금액
                </span>
                <span className="text-[19px] font-extrabold text-primary">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
              <span className="text-xs text-gray-500">
                쿠폰 및 포인트는 결제 시 사용 가능합니다.
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="px-5 py-4">
          <div className="flex flex-col h-48 justify-center items-center gap-4 bg-white rounded-card shadow-card-sm">
            <span className="text-[15px] font-bold text-gray-900">
              장바구니가 비어 있어요
            </span>
            <Button asChild>
              <Link to="/stores">쇼핑하기</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white">
        <RecommendProducts excludeIds={cartItems.map((item) => item.product.id)} />
      </div>

      {/* 결제 모달 */}
      <ProductPurchaseModal
        open={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setPurchaseItems([]);
        }}
        items={purchaseItems}
        address={address}
        cartItemIds={purchaseCartIdsRef.current}
      />
    </Content>
  );
}
