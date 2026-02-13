import { useMemo, useState, useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import Modal from "~/common/components/modal";
import { Button } from "~/common/components/ui/button";
import DeliveryAddress from "./delivery-address";
import {
  type OrderItem,
  type SellerOrderGroup,
  groupOrderItemsBySeller,
} from "~/features/orders/types";
import type { UserAddress } from "~/features/users/queries";
import { useAlert } from "~/hooks/useAlert";

interface ProductPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  /** 주문할 상품 목록 */
  items: OrderItem[];
  /** 배송 주소 (초기값) */
  address: UserAddress | null;
  /** 주문 완료 후 콜백 (장바구니 아이템 삭제 등) */
  onOrderComplete?: (orderNumber: string) => void;
  /** 장바구니 아이템 ID 목록 (결제 성공 후 삭제용) */
  cartItemIds?: string[];
}

export default function ProductPurchaseModal({
  open,
  onClose,
  items,
  address: initialAddress,
  cartItemIds,
}: ProductPurchaseModalProps) {
  const fetcher = useFetcher();
  const { alert } = useAlert();
  const hasHandledRef = useRef(false);

  // 선택된 배송 주소 (변경 가능)
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    initialAddress
  );

  // 배송 메시지 상태
  const [deliveryMessageOption, setDeliveryMessageOption] = useState<string>("none");
  const [customDeliveryMessage, setCustomDeliveryMessage] = useState<string>("");

  // TossPayments Widget 관련 상태
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paymentWidget, setPaymentWidget] = useState<any>(null);
  const [isWidgetReady, setIsWidgetReady] = useState(false);

  // 모달이 열릴 때 초기 주소로 리셋
  useEffect(() => {
    if (open) {
      setSelectedAddress(initialAddress);
      setDeliveryMessageOption("none");
      setCustomDeliveryMessage("");
      hasHandledRef.current = false;
    }
  }, [open, initialAddress]);

  // 최종 배송 메시지
  const deliveryMessage =
    deliveryMessageOption === "none"
      ? ""
      : deliveryMessageOption === "custom"
        ? customDeliveryMessage
        : deliveryMessageOption;

  // 판매자별 그룹핑
  const sellerGroups = useMemo(() => groupOrderItemsBySeller(items), [items]);

  // 전체 상품 수량
  const totalItemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  // 전체 결제 금액 계산
  const totalAmount = useMemo(() => {
    const productAmount = sellerGroups.reduce((sum, g) => sum + g.subtotal, 0);
    const shippingFee = sellerGroups.reduce((sum, g) => sum + g.shippingFee, 0);
    return productAmount + shippingFee;
  }, [sellerGroups]);

  // 모달이 열릴 때 TossPayments 위젯 초기화
  useEffect(() => {
    if (!open || totalAmount <= 0) {
      setPaymentWidget(null);
      setIsWidgetReady(false);
      return;
    }

    let cancelled = false;

    const initWidget = async () => {
      try {
        const tossPayments = await loadTossPayments(
          import.meta.env.VITE_TOSS_CLIENT_KEY
        );
        if (cancelled) return;

        const widget = tossPayments.widgets({ customerKey: "anonymous" });
        await widget.setAmount({ currency: "KRW", value: totalAmount });

        if (cancelled) return;
        setPaymentWidget(widget);
      } catch (error) {
        console.error("TossPayments 초기화 실패:", error);
      }
    };

    initWidget();

    return () => {
      cancelled = true;
    };
  }, [open, totalAmount]);

  // 위젯이 준비되면 DOM에 렌더링
  useEffect(() => {
    if (!paymentWidget) return;

    let cancelled = false;

    const renderWidget = async () => {
      try {
        await paymentWidget.renderPaymentMethods({
          selector: "#toss-payment-method",
        });
        await paymentWidget.renderAgreement({
          selector: "#toss-agreement",
        });
        if (!cancelled) setIsWidgetReady(true);
      } catch (error) {
        console.error("TossPayments 위젯 렌더링 실패:", error);
      }
    };

    renderWidget();

    return () => {
      cancelled = true;
    };
  }, [paymentWidget]);

  // 금액 변경 시 위젯 업데이트
  useEffect(() => {
    if (paymentWidget && totalAmount > 0) {
      paymentWidget.setAmount({ currency: "KRW", value: totalAmount });
    }
  }, [paymentWidget, totalAmount]);

  const isSubmitting = fetcher.state !== "idle";

  // 주문 결과 처리 → 서버 응답 후 requestPayment() 호출
  useEffect(() => {
    console.log("[결제] fetcher 상태 변경:", {
      state: fetcher.state,
      data: fetcher.data,
      hasHandled: hasHandledRef.current,
      paymentWidgetReady: !!paymentWidget,
    });

    if (fetcher.data && !hasHandledRef.current) {
      hasHandledRef.current = true;

      if (fetcher.data.success && paymentWidget) {
        const { orderNumber } = fetcher.data;
        const orderName =
          items.length > 1
            ? `${items[0].product.name} 외 ${items.length - 1}건`
            : items[0].product.name;

        console.log("[결제] 주문 생성 성공, requestPayment 호출:", {
          orderNumber,
          orderName,
          successUrl: `${window.location.origin}/payments/success`,
          failUrl: `${window.location.origin}/payments/fail`,
        });

        // 장바구니 정리용 ID를 sessionStorage에 저장
        if (cartItemIds && cartItemIds.length > 0) {
          sessionStorage.setItem(
            "pending_cart_cleanup",
            JSON.stringify(cartItemIds)
          );
        }

        paymentWidget
          .requestPayment({
            orderId: orderNumber,
            orderName,
            successUrl: `${window.location.origin}/payments/success`,
            failUrl: `${window.location.origin}/payments/fail`,
          })
          .catch((error: { code?: string }) => {
            if (error.code === "USER_CANCEL") {
              // 사용자가 결제를 취소한 경우 - 다시 시도 가능하도록 리셋
              hasHandledRef.current = false;
            }
            console.error("[결제] 결제 요청 실패:", error);
          });
      } else if (fetcher.data.success && !paymentWidget) {
        console.error("[결제] 주문은 생성됐지만 paymentWidget이 null입니다");
      } else if (!fetcher.data.success) {
        console.error("[결제] 주문 생성 실패:", fetcher.data.error);
        alert({
          title: "주문 실패",
          message: fetcher.data.error ?? "주문에 실패했습니다.",
          primaryButton: { label: "확인" },
        });
      }
    }
  }, [fetcher.data]);

  const handleSubmitOrder = () => {
    if (!selectedAddress) {
      alert({
        title: "알림",
        message: "배송지를 선택해주세요.",
        primaryButton: { label: "확인", onClick: () => {} },
      });
      return;
    }
    if (items.length === 0) {
      alert({
        title: "알림",
        message: "주문할 상품이 없습니다.",
        primaryButton: { label: "확인", onClick: () => {} },
      });
      return;
    }
    if (!isWidgetReady) {
      alert({
        title: "알림",
        message: "결제 수단을 불러오는 중입니다. 잠시만 기다려주세요.",
        primaryButton: { label: "확인", onClick: () => {} },
      });
      return;
    }

    hasHandledRef.current = false;

    console.log("[결제] 주문 생성 요청 시작", {
      address: selectedAddress,
      sellerGroups,
      items,
      deliveryMessage,
    });

    fetcher.submit(
      {
        intent: "create",
        address: JSON.stringify(selectedAddress),
        sellerGroups: JSON.stringify(sellerGroups),
        items: JSON.stringify(items),
        deliveryMessage: deliveryMessage,
      },
      { method: "POST", action: "/orders/action" }
    );
  };

  return (
    <Modal
      open={open}
      title="결제"
      onClose={onClose}
      footer={
        <Button
          variant="secondary"
          className="flex w-full h-12.5 rounded-full"
          onClick={handleSubmitOrder}
          disabled={isSubmitting || !isWidgetReady}
        >
          {isSubmitting
            ? "주문 처리중..."
            : `${totalAmount.toLocaleString()}원 결제하기`}
        </Button>
      }
    >
      <DeliveryAddress
        address={selectedAddress}
        onAddressChange={setSelectedAddress}
        deliveryMessageOption={deliveryMessageOption}
        onDeliveryMessageOptionChange={setDeliveryMessageOption}
        customDeliveryMessage={customDeliveryMessage}
        onCustomDeliveryMessageChange={setCustomDeliveryMessage}
      />

      <div className="flex w-full flex-col pt-5.5 pb-4 px-4 items-start gap-5 bg-white">
        {/* 주문 상품 헤더 */}
        <div className="flex px-4 items-center gap-2.5 self-stretch">
          <span className="text-lg font-bold leading-4.5 tracking-[-0.4px]">
            주문 상품
          </span>
          <div className="flex items-center gap-2 self-stretch">
            <span className="text-sm text-muted">{totalItemCount}개</span>
          </div>
        </div>

        {/* 판매자별 상품 그룹 */}
        {sellerGroups.map((group, groupIndex) => (
          <SellerGroupCard key={group.seller?.id ?? groupIndex} group={group} />
        ))}

        {/* 안내 문구 */}
        <div className="flex px-4 w-full justify-center">
          <span className="text-xs leading-4 tracking-[-0.4px] text-muted/60 text-center">
            *판매자 배송 상품을 여러개 구매한 경우, 구매한 상품은 함께 배송될
            수 있으며 늦발송이 늦어질수 있습니다.
          </span>
        </div>
      </div>

      {/* 결제 수단 섹션 - TossPayments 위젯 */}
      <div className="flex w-full flex-col py-5 px-4 items-start gap-4 bg-white border-t-4 border-t-muted/10">
        <span className="text-lg font-bold leading-4.5 tracking-[-0.4px]">
          결제 수단
        </span>
        <div id="toss-payment-method" className="w-full" />
        <div id="toss-agreement" className="w-full" />
        {!isWidgetReady && (
          <div className="flex w-full h-32 items-center justify-center">
            <span className="text-sm text-muted">
              결제 수단을 불러오는 중...
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * 판매자별 상품 그룹 카드
 */
function SellerGroupCard({ group }: { group: SellerOrderGroup }) {
  return (
    <div className="flex flex-col items-center self-stretch rounded-lg border-1 border-muted/30">
      {/* 판매자 헤더 */}
      <div className="flex w-full pt-2.5 px-4 items-center gap-1 border-b-1 border-b-muted/30">
        <span className="text-base font-bold leading-4 tracking-[-0.4px]">
          {group.seller?.name ?? "판매자 정보 없음"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="2"
          height="24"
          viewBox="0 0 2 24"
          fill="none"
        >
          <path
            d="M1 18.5L1 4.5"
            stroke="#939393"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex gap-2 items-center self-stretch">
          <span className="text-muted">{group.itemCount}개</span>
        </div>
        <div className="flex h-7 justify-end items-center gap-2 flex-gsb">
          <span className="text-muted">
            배송비{" "}
            <span className="text-black">
              {group.shippingFee > 0
                ? `${group.shippingFee.toLocaleString()}원`
                : "무료"}
            </span>
          </span>
        </div>
      </div>

      {/* 상품 목록 */}
      {group.items.map((item, index) => (
        <OrderItemCard key={`${item.skuId}-${index}`} item={item} />
      ))}

      {/* 금액 정보 */}
      <div className="flex w-full px-4 flex-col py-2.5 justify-center items-start gap-2.5">
        <div className="flex w-full h-3.5 items-center justify-between">
          <span className="text-xs leading-3 tracking-[-0.4px] text-muted">
            결제 금액
          </span>
          <div className="flex-gsb text-right">
            <span className="text-sm font-bold leading-3.5 tracking-[-0.4px]">
              {group.subtotal.toLocaleString()}원
            </span>
          </div>
        </div>
        {/* TODO: 쿠폰 할인 로직 연동 시 활성화 */}
        {/* <div className="flex w-full h-3.5 items-center justify-between">
          <span className="text-xs leading-3 tracking-[-0.4px] text-muted">
            쿠폰 할인
          </span>
          <div className="flex-gsb text-right">
            <span className="text-sm font-bold leading-3.5 tracking-[-0.4px] text-accent">
              -1,000원
            </span>
          </div>
        </div> */}
      </div>

      {/* 최종 금액 */}
      <div className="px-4 pb-4 flex flex-col w-full justify-center items-start">
        <div className="flex w-full h-3 items-center border-t-1 border-t-muted/30"></div>
        <div className="flex w-full h-3 items-center">
          <span className="text-sm font-bold leading-3 tracking-[-0.4px]">
            최종 결제 금액
          </span>
          <span className="text-right flex-gsb text-base font-bold leading-4 tracking-[-0.4px]">
            {group.subtotal.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * 개별 주문 상품 카드
 */
function OrderItemCard({ item }: { item: OrderItem }) {
  // 옵션 문자열 생성
  const optionText = item.sku.options
    ? Object.values(item.sku.options).join(" / ")
    : "";

  return (
    <div className="flex w-full flex-col gap-2.5 py-2.5">
      {/* 상품 정보 */}
      <div className="flex w-full px-4 items-center gap-2.5">
        <div className="flex size-19 justify-center items-center shrink-0 rounded-md overflow-hidden bg-muted/10">
          {item.product.mainImage ? (
            <img
              src={item.product.mainImage}
              alt={item.product.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-muted/20" />
          )}
        </div>
        <div className="flex flex-col items-start gap-2 flex-gsb self-stretch">
          <div className="flex items-center self-stretch">
            <span className="text-xs leading-3.5 tracking-[-0.4px] line-clamp-2">
              {item.product.name}
            </span>
          </div>
          <div className="flex items-center self-stretch">
            <span className="text-xs leading-3 tracking-[-0.4px] text-muted">
              {/* TODO: 발송 예정일 */}
              발송 예정
            </span>
          </div>
        </div>
      </div>

      {/* 옵션 및 수량 */}
      {optionText && (
        <div className="flex w-full px-4 items-center">
          <div className="flex w-full h-8 pl-2.5 items-center gap-1 self-stretch rounded-xs bg-secondary/10">
            <span className="text-xs leading-4 tracking-[-0.4px]">
              {optionText}
            </span>
            <div className="flex py-0.25 px-5 flex-col justify-center items-end flex-gsb">
              <span className="text-xs leading-3 tracking-[-0.4px]">
                {item.quantity}개
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
