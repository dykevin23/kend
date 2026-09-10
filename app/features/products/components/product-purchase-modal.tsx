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

// iOS 심사 재제출 시 결제 기능을 숨겨야 하면 true로 전환 (2026-09-01: 현재 심사 진행 중 아님, 결제 활성화 상태로 둠)
const PAYMENT_COMING_SOON = false;

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
  // 위젯 초기화/렌더 실패 시 사용자에게 보여줄 메시지 (null이면 정상)
  const [widgetError, setWidgetError] = useState<string | null>(null);
  // "다시 시도" 클릭 시 증가시켜 초기화 effect 재실행
  const [widgetRetryNonce, setWidgetRetryNonce] = useState(0);

  const handleRetryWidget = () => {
    setWidgetError(null);
    setIsWidgetReady(false);
    setPaymentWidget(null);
    setWidgetRetryNonce((n) => n + 1);
  };

  // 모달이 열릴 때 초기 주소로 리셋
  useEffect(() => {
    if (open) {
      setSelectedAddress(initialAddress);
      setDeliveryMessageOption("none");
      setCustomDeliveryMessage("");
      setIsOpeningPayment(false);
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

  // 금액이 유효한지 (NaN/음수/0 방어 — `<= 0`만으로는 NaN을 못 거른다)
  const isAmountValid = Number.isFinite(totalAmount) && totalAmount > 0;

  // 모달이 열릴 때 TossPayments 위젯 초기화
  useEffect(() => {
    if (PAYMENT_COMING_SOON) return;
    if (!open) {
      setPaymentWidget(null);
      setIsWidgetReady(false);
      setWidgetError(null);
      return;
    }
    if (!isAmountValid) {
      setPaymentWidget(null);
      setIsWidgetReady(false);
      setWidgetError(
        "결제 금액을 계산할 수 없습니다. 장바구니를 다시 확인해주세요."
      );
      return;
    }

    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
    if (!clientKey) {
      console.error("VITE_TOSS_CLIENT_KEY가 설정되지 않았습니다.");
      setPaymentWidget(null);
      setIsWidgetReady(false);
      setWidgetError(
        "결제 설정 오류로 결제를 진행할 수 없습니다. 문제가 지속되면 고객센터로 문의해주세요."
      );
      return;
    }

    let cancelled = false;
    setWidgetError(null);

    const initWidget = async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        if (cancelled) return;

        const widget = tossPayments.widgets({ customerKey: "anonymous" });
        await widget.setAmount({ currency: "KRW", value: totalAmount });

        if (cancelled) return;
        setPaymentWidget(widget);
      } catch (error) {
        if (cancelled) return;
        console.error("TossPayments 초기화 실패:", error);
        setWidgetError("결제 수단을 불러오지 못했습니다. 다시 시도해주세요.");
      }
    };

    initWidget();

    return () => {
      cancelled = true;
    };
  }, [open, totalAmount, isAmountValid, widgetRetryNonce]);

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
        if (cancelled) return;
        console.error("TossPayments 위젯 렌더링 실패:", error);
        setWidgetError("결제 수단을 표시하지 못했습니다. 다시 시도해주세요.");
      }
    };

    renderWidget();

    return () => {
      cancelled = true;
    };
  }, [paymentWidget]);

  // 금액 변경 시 위젯 업데이트
  useEffect(() => {
    if (paymentWidget && isAmountValid) {
      paymentWidget.setAmount({ currency: "KRW", value: totalAmount });
    }
  }, [paymentWidget, totalAmount, isAmountValid]);

  const isSubmitting = fetcher.state !== "idle";
  // 주문 생성 후 Toss 결제창으로 이동하기 직전까지의 상태
  // (requestPayment의 네트워크 호출 ~수백ms 동안 버튼 잠금 + 이중탭 방지)
  const [isOpeningPayment, setIsOpeningPayment] = useState(false);

  // 주문 결과 처리 → 서버 응답 후 requestPayment() 호출
  useEffect(() => {
    if (fetcher.data && !hasHandledRef.current) {
      hasHandledRef.current = true;

      if (fetcher.data.success && paymentWidget) {
        const { orderNumber } = fetcher.data;
        const orderName =
          items.length > 1
            ? `${items[0].product.name} 외 ${items.length - 1}건`
            : items[0].product.name;

        // 장바구니 정리용 ID를 sessionStorage에 저장
        if (cartItemIds && cartItemIds.length > 0) {
          sessionStorage.setItem(
            "pending_cart_cleanup",
            JSON.stringify(cartItemIds)
          );
        }

        setIsOpeningPayment(true);

        // 결제 취소/실패 시 돌아올 화면 (장바구니 vs 상품상세 등 시작 지점)
        const returnTo = window.location.pathname;

        paymentWidget
          .requestPayment({
            orderId: orderNumber,
            orderName,
            successUrl: `${window.location.origin}/payments/success`,
            failUrl: `${window.location.origin}/payments/fail?returnTo=${encodeURIComponent(
              returnTo
            )}`,
            // 모바일/WebView에서는 현재 창을 그대로 결제창으로 이동시킨다
            // (팝업/새 창을 열지 않음 — 모바일 기본값이지만 명시)
            windowTarget: "self",
          })
          .catch((error: { code?: string; message?: string }) => {
            // requestPayment 실패/취소 시엔 페이지 이동이 없으므로 상태를 되돌린다
            setIsOpeningPayment(false);
            // 사용자가 결제를 취소/중단한 경우 - 조용히 다시 시도 가능하게만 리셋
            if (
              error.code === "USER_CANCEL" ||
              error.code === "PAY_PROCESS_CANCELED"
            ) {
              hasHandledRef.current = false;
              return;
            }
            console.error("[결제] 결제 요청 실패:", error);
            hasHandledRef.current = false;
            alert({
              title: "결제 실패",
              message:
                error.message ??
                "결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.",
              primaryButton: { label: "확인" },
            });
          });
      } else if (fetcher.data.success && !paymentWidget) {
        console.error("[결제] 주문은 생성됐지만 paymentWidget이 null입니다");
        hasHandledRef.current = false;
        setIsOpeningPayment(false);
        alert({
          title: "결제 오류",
          message:
            "결제 수단이 준비되지 않았습니다. 결제 창을 닫고 다시 시도해주세요.",
          primaryButton: { label: "확인" },
        });
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
    if (widgetError) {
      alert({
        title: "알림",
        message: "결제 수단을 불러오지 못했습니다. '다시 시도'를 눌러주세요.",
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
          disabled={
            PAYMENT_COMING_SOON ||
            isSubmitting ||
            isOpeningPayment ||
            !isWidgetReady
          }
        >
          {PAYMENT_COMING_SOON
            ? "서비스 준비 중"
            : isSubmitting
              ? "주문 처리중..."
              : isOpeningPayment
                ? "결제창 여는 중..."
                : isAmountValid
                  ? `${totalAmount.toLocaleString()}원 결제하기`
                  : "결제하기"}
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

      {/* 결제 수단 섹션 */}
      <div className="flex w-full flex-col py-5 px-4 items-start gap-4 bg-white border-t-4 border-t-muted/10">
        <span className="text-lg font-bold leading-4.5 tracking-[-0.4px]">
          결제 수단
        </span>
        {PAYMENT_COMING_SOON ? (
          <div className="flex w-full flex-col items-center justify-center gap-2 py-10 px-4 rounded-lg bg-muted/5">
            <span className="text-base font-bold leading-5 tracking-[-0.4px]">
              서비스 준비 중입니다
            </span>
            <span className="text-sm text-muted text-center leading-5">
              결제 기능은 곧 제공될 예정입니다.
              <br />
              조금만 기다려주세요.
            </span>
          </div>
        ) : (
          <>
            <div id="toss-payment-method" className="w-full" />
            <div id="toss-agreement" className="w-full" />
            {widgetError ? (
              <div className="flex w-full flex-col items-center justify-center gap-3 py-8 px-4 rounded-lg bg-muted/5">
                <span className="text-sm text-muted text-center leading-5">
                  {widgetError}
                </span>
                <Button
                  variant="outline"
                  className="h-9 rounded-full px-5"
                  onClick={handleRetryWidget}
                >
                  다시 시도
                </Button>
              </div>
            ) : (
              !isWidgetReady && (
                <div className="flex w-full h-32 items-center justify-center">
                  <span className="text-sm text-muted">
                    결제 수단을 불러오는 중...
                  </span>
                </div>
              )
            )}
          </>
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
              판매자 확인 후 3영업일 이내 발송 예정
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
