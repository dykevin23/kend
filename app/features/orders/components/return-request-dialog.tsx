import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/common/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import { useAlert } from "~/hooks/useAlert";
import type { ReturnReasonType } from "../types";

const RETURN_REASON_LABELS: Record<ReturnReasonType, string> = {
  CHANGE_OF_MIND: "단순변심",
  DEFECT: "상품하자",
  WRONG_ITEM: "오배송",
  DAMAGED: "배송중 파손",
  LOST: "배송중 분실",
};

interface ReturnRequestDialogProps {
  deliveryItemId: string;
}

/**
 * 반품 신청 다이얼로그 — delivery_item 단위, 사유 선택 후 제출
 */
export default function ReturnRequestDialog({
  deliveryItemId,
}: ReturnRequestDialogProps) {
  const fetcher = useFetcher();
  const { alert } = useAlert();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReturnReasonType | "">("");

  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data && fetcher.data.success === false) {
      alert({
        title: "반품 신청 실패",
        message: fetcher.data.error ?? "반품 신청에 실패했어요.",
        primaryButton: { label: "확인" },
      });
    }
  }, [fetcher.data]);

  const handleSubmit = () => {
    if (!reason) return;

    const formData = new FormData();
    formData.append("intent", "requestReturn");
    formData.append("deliveryItemId", deliveryItemId);
    formData.append("reason", reason);
    fetcher.submit(formData, { method: "POST", action: "/orders/action" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          반품 신청
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>반품 신청</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Select
            value={reason}
            onValueChange={(value) => setReason(value as ReturnReasonType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="반품 사유를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RETURN_REASON_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            className="w-full"
            disabled={!reason || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "신청 중..." : "반품 신청하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
