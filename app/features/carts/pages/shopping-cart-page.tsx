import { useMemo, useState } from "react";
import { redirect, useLoaderData, useFetcher, Link } from "react-router";
import type { Route } from "./+types/shopping-cart-page";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Label } from "~/common/components/ui/label";
import CartProductCard from "../compoents/cart-product-card";
import Divider from "~/common/components/divider";
import RecommendProducts from "~/features/products/components/recommend-products";
import ProductPurchaseModal from "~/features/products/components/product-purchase-modal";
import { makeSSRClient } from "~/supa-client";
import { getCartItems } from "../queries";
import {
  removeFromCart,
  removeMultipleFromCart,
  updateCartQuantity,
} from "../mutations";
import { type OrderItem, cartItemToOrderItem } from "~/features/orders/types";
import { getUserProfile, getDefaultAddress } from "~/features/users/queries";

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
};

export default function ShoppingCartPage() {
  const { cartItems, address } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(cartItems.map((item) => item.id)),
  );
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState<OrderItem[]>([]);

  const isAllSelected =
    cartItems.length > 0 && selectedIds.size === cartItems.length;

  const handleCheckAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map((item) => item.id)));
    }
  };

  const handleCheckItem = (id: string, checked: boolean) => {
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

  // 선택된 상품들의 총 금액 계산
  const { totalProductPrice, totalPrice } = useMemo(() => {
    let productTotal = 0;
    cartItems.forEach((item) => {
      if (selectedIds.has(item.id)) {
        productTotal += item.sku.salePrice * item.quantity;
      }
    });
    // TODO: 배송비 계산 로직 추가
    const shippingFee = 0;
    return {
      totalProductPrice: productTotal,
      totalPrice: productTotal + shippingFee,
    };
  }, [cartItems, selectedIds]);

  const isUpdating = fetcher.state !== "idle";

  // 결제하기 버튼 클릭
  const handlePurchase = () => {
    if (selectedIds.size === 0) return;

    // 선택된 장바구니 아이템을 OrderItem으로 변환
    const selectedCartItems = cartItems.filter((item) =>
      selectedIds.has(item.id)
    );
    const orderItems = selectedCartItems.map(cartItemToOrderItem);

    setPurchaseItems(orderItems);
    setIsPurchaseModalOpen(true);
  };

  return (
    <Content
      headerPorps={{ title: "장바구니", useRight: false }}
      footer={
        cartItems.length > 0 && (
          <Button
            variant="secondary"
            className="flex w-full h-12.5 px-7.5 justify-center items-center rounded-full"
            disabled={selectedIds.size === 0}
            onClick={handlePurchase}
          >
            결제하기
          </Button>
        )
      }
    >
      {cartItems.length > 0 ? (
        <>
          <div className="flex w-full p-4 items-center gap-2 border-b-1 border-b-muted/30">
            <div className="flex justify-end items-center gap-1.5">
              <Checkbox
                className="size-6"
                id="all"
                checked={isAllSelected}
                onCheckedChange={handleCheckAll}
              />
              <Label htmlFor="all" className="text-base leading-4 text-black">
                전체선택
              </Label>
            </div>
            <div className="flex justify-end items-center flex-gsb">
              <button
                className="text-xs leading-3 hover:underline disabled:opacity-50"
                onClick={handleRemoveSelected}
                disabled={selectedIds.size === 0 || isUpdating}
              >
                상품삭제
              </button>
            </div>
          </div>

          {cartItems.map((item) => (
            <div key={item.id}>
              <CartProductCard
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
              <Divider />
            </div>
          ))}

          <div className="flex w-full py-4.5 px-4 flex-col items-start gap-5">
            <div className="flex px-4 items-center gap-2.5 self-stretch">
              <span className="text-base font-bold leading-[100%] tracking-[-0.4px]">
                결제 예상 금액
              </span>
              <div className="flex justify-end items-center gap-2.5 flex-gsb self-stretch">
                <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center items-start gap-2.5 self-stretch">
              <div className="flex items-center gap-1 self-stretch">
                <div className="flex px-4 items-center gap-1 self-stretch">
                  <span className="text-sm leading-[140%] tracking-[-0.4px]">
                    상품 금액
                  </span>
                </div>
                <div className="flex px-4 justify-end items-center gap-1 flex-gsb self-stretch">
                  <span className="text-sm leading-[140%] tracking-[-0.4px]">
                    {totalProductPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 self-stretch">
                <div className="flex px-4 items-center gap-1 self-stretch">
                  <span className="text-sm leading-[140%] tracking-[-0.4px]">
                    배송비
                  </span>
                </div>
                <div className="flex px-4 justify-end items-center gap-1 flex-gsb self-stretch">
                  <span className="text-sm leading-[140%] tracking-[-0.4px]">
                    0원
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-1 self-stretch">
              <div className="flex px-4 items-center gap-1 self-stretch">
                <span className="text-sm leading-[140%] tracking-[-0.4px]">
                  쿠폰 및 포인트는 결제 시 사용 가능합니다.
                </span>
              </div>
            </div>
          </div>
          <Divider />

          <div className="flex w-full py-4.5 px-4 flex-col items-start gap-5">
            <div className="flex px-4 items-center gap-2.5 self-stretch">
              <span className="text-base font-bold leading-[100%] tracking-[-0.4px]">
                총 결제 금액
              </span>
              <div className="flex justify-end items-center gap-2.5 flex-gsb self-stretch">
                <span className="text-lg font-bold leading-[100%] tracking-[-0.4px] text-accent">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
          <Divider />
        </>
      ) : (
        /* 장바구니 비어있을경우 start */
        <div className="flex flex-col w-full p-4 items-start gap-5">
          <div className="flex flex-col w-full h-48 justify-center items-center gap-4 rounded-md border-1 border-muted/30">
            <div className="flex justify-center items-center self-stretch">
              <span className="flex-gsb text-center text-base font-bold leading-5 tracking-[-0.4px]">
                장바구니가 비어 있어요
              </span>
            </div>
            <Button variant="secondary" asChild>
              <Link to="/stores">쇼핑하기</Link>
            </Button>
          </div>
        </div>
        /* 장바구니 비어있을경우 end */
      )}

      <div className="flex pt-4 flex-col items-start gap-1">
        <RecommendProducts />
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
      />
    </Content>
  );
}
