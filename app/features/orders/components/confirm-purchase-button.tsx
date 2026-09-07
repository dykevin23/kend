import { useEffect } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/common/components/ui/button";
import { useAlert } from "~/hooks/useAlert";
import { cn } from "~/lib/utils";

/**
 * 상품 1개 구매확정 버튼 — 버튼마다 독립된 fetcher를 가져야
 * 한 상품 처리 중 표시가 다른 상품 버튼에 번지지 않는다.
 * 클릭 시 확인창을 먼저 띄운다.
 */
export function ConfirmPurchaseButton({
  deliveryItemId,
  className,
}: {
  deliveryItemId: string;
  className?: string;
}) {
  const fetcher = useFetcher();
  const { alert, confirm } = useAlert();
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data && fetcher.data.success === false) {
      alert({
        title: "구매확정 실패",
        message: fetcher.data.error ?? "구매확정 처리에 실패했어요.",
        primaryButton: { label: "확인" },
      });
    }
  }, [fetcher.data]);

  const submit = () => {
    const formData = new FormData();
    formData.append("intent", "confirmPurchase");
    formData.append("deliveryItemId", deliveryItemId);
    fetcher.submit(formData, { method: "POST", action: "/orders/action" });
  };

  const handleClick = () => {
    confirm({
      title: "구매확정",
      message: "구매를 확정하시겠어요? 확정 후에는 반품 신청이 제한됩니다.",
      primaryButton: { label: "구매확정", onClick: submit },
      secondaryButton: { label: "취소", onClick: () => {} },
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("text-xs", className)}
      disabled={isSubmitting}
      onClick={handleClick}
    >
      {isSubmitting ? "처리 중..." : "구매확정"}
    </Button>
  );
}

/**
 * 주문(판매자) 내 상품이 전부 정상 상태일 때, 미확정 상품을 한 번에 구매확정하는 버튼
 */
export function BulkConfirmPurchaseButton({
  deliveryItemIds,
}: {
  deliveryItemIds: string[];
}) {
  const fetcher = useFetcher();
  const { alert, confirm } = useAlert();
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data && fetcher.data.success === false) {
      alert({
        title: "구매확정 실패",
        message: fetcher.data.error ?? "구매확정 처리에 실패했어요.",
        primaryButton: { label: "확인" },
      });
    }
  }, [fetcher.data]);

  const submit = () => {
    const formData = new FormData();
    formData.append("intent", "confirmPurchaseBulk");
    deliveryItemIds.forEach((id) => formData.append("deliveryItemId", id));
    fetcher.submit(formData, { method: "POST", action: "/orders/action" });
  };

  const handleClick = () => {
    confirm({
      title: "전체 구매확정",
      message: `상품 ${deliveryItemIds.length}건을 모두 구매확정하시겠어요? 확정 후에는 반품 신청이 제한됩니다.`,
      primaryButton: { label: "전체 구매확정", onClick: submit },
      secondaryButton: { label: "취소", onClick: () => {} },
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full text-xs"
      disabled={isSubmitting}
      onClick={handleClick}
    >
      {isSubmitting ? "처리 중..." : `전체 구매확정 (${deliveryItemIds.length})`}
    </Button>
  );
}
