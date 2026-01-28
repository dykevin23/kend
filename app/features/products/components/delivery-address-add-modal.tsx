import { useEffect, useState, useRef, type FormEvent } from "react";
import { useFetcher } from "react-router";
import { Trash2 } from "lucide-react";
import InputWithLabel from "~/common/components/input-with-label";
import Modal from "~/common/components/modal";
import DaumPostCodeModal from "~/common/components/daum-post-code-modal";
import { Button } from "~/common/components/ui/button";
import { Switch } from "~/common/components/ui/switch";
import { Label } from "~/common/components/ui/label";
import { addAddressSchema } from "~/features/users/schema.validation";
import { useAlert } from "~/hooks/useAlert";
import type { UserAddress } from "~/features/users/queries";

interface DeliveryAddressAddModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** 수정할 주소 (수정 모드일 때 전달) */
  editAddress?: UserAddress | null;
}

export default function DeliveryAddressAddModal({
  open,
  onClose,
  onSuccess,
  editAddress,
}: DeliveryAddressAddModalProps) {
  const fetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const hasHandledSuccessRef = useRef(false);
  const hasHandledDeleteRef = useRef(false);
  const isEditMode = !!editAddress;
  const { confirm } = useAlert();

  // 기본 배송지 설정 상태
  const [isDefault, setIsDefault] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // 주소 검색 결과 state
  const [zoneCode, setZoneCode] = useState("");
  const [address, setAddress] = useState("");
  // 수정 모드에서 사용할 form 필드 state
  const [label, setLabel] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  // 모달이 열릴 때 editAddress 값으로 초기화
  useEffect(() => {
    if (open && editAddress) {
      setZoneCode(editAddress.zoneCode);
      setAddress(editAddress.address);
      setLabel(editAddress.label);
      setAddressDetail(editAddress.addressDetail ?? "");
      setRecipientName(editAddress.recipientName);
      setRecipientPhone(editAddress.recipientPhone);
      setIsDefault(editAddress.isDefault);
    }
  }, [open, editAddress]);

  const handlePostCodeComplete = (data: { zoneCode: string; address: string }) => {
    setZoneCode(data.zoneCode);
    setAddress(data.address);
  };

  const resetForm = () => {
    setZoneCode("");
    setAddress("");
    setLabel("");
    setAddressDetail("");
    setRecipientName("");
    setRecipientPhone("");
    setIsDefault(false);
    setIsConfirmed(false);
    formRef.current?.reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 저장 성공 시 모달 닫기
  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === "idle" && !hasHandledSuccessRef.current) {
      hasHandledSuccessRef.current = true;
      resetForm();
      onSuccess?.();
      onClose();
    }
  }, [fetcher.data, fetcher.state, onClose, onSuccess]);

  // 삭제 성공 시 모달 닫기
  useEffect(() => {
    if (deleteFetcher.data?.success && deleteFetcher.state === "idle" && !hasHandledDeleteRef.current) {
      hasHandledDeleteRef.current = true;
      resetForm();
      onSuccess?.();
      onClose();
    }
  }, [deleteFetcher.data, deleteFetcher.state, onClose, onSuccess]);

  // 모달이 열릴 때 ref 리셋
  useEffect(() => {
    if (open) {
      hasHandledSuccessRef.current = false;
      hasHandledDeleteRef.current = false;
    }
  }, [open]);

  const handleDelete = () => {
    if (!editAddress) return;
    deleteFetcher.submit(
      { intent: "delete", addressId: editAddress.id },
      { method: "post", action: "/users/addresses" }
    );
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // zod validation (state 값 사용)
    const result = addAddressSchema.safeParse({
      label: label.trim(),
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      zoneCode,
      address,
      addressDetail: addressDetail.trim() || undefined,
    });

    if (!result.success) {
      e.preventDefault();
      const firstError = result.error.errors[0]?.message ?? "입력값을 확인해주세요.";
      // TODO: toast로 변경 예정
      console.error(firstError);
      return;
    }

    // 신규 등록 시 기본 배송지 확인 (아직 확인 안 한 경우)
    if (!isEditMode && !isConfirmed) {
      e.preventDefault();
      confirm({
        title: "기본 배송지 설정",
        message: "등록한 배송지를 기본 배송지로 설정하시겠습니까?",
        primaryButton: {
          label: "예",
          onClick: () => {
            setIsDefault(true);
            setIsConfirmed(true);
            setTimeout(() => formRef.current?.requestSubmit(), 0);
          },
        },
        secondaryButton: {
          label: "아니오",
          onClick: () => {
            setIsDefault(false);
            setIsConfirmed(true);
            setTimeout(() => formRef.current?.requestSubmit(), 0);
          },
        },
      });
      return;
    }
  };

  const isSubmitting = fetcher.state !== "idle";
  const isDeleting = deleteFetcher.state !== "idle";

  return (
    <Modal
      open={open}
      title={isEditMode ? "배송 주소 수정" : "배송 주소 추가"}
      onClose={handleClose}
      headerRight={
        isEditMode ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="size-5" />
          </button>
        ) : undefined
      }
      footer={
        <Button
          type="submit"
          form="address-form"
          variant="secondary"
          className="flex w-full h-12.5 rounded-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "저장하기"}
        </Button>
      }
    >
      <fetcher.Form
        ref={formRef}
        id="address-form"
        method="post"
        action="/users/addresses"
        onSubmit={handleSubmit}
        className="flex w-full pt-7.5 flex-col items-start shrink-0"
      >
        {/* disabled input은 form submit 시 전달되지 않으므로 hidden input 사용 */}
        <input type="hidden" name="zoneCode" value={zoneCode} />
        <input type="hidden" name="address" value={address} />
        <input type="hidden" name="isDefault" value={isDefault ? "true" : "false"} />
        {/* 수정 모드일 때 intent와 addressId 전달 */}
        {isEditMode && (
          <>
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="addressId" value={editAddress.id} />
          </>
        )}

        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full items-center gap-1">
            <InputWithLabel
              label="우편번호"
              name="zoneCode"
              placeholder="우편번호를 입력해주세요."
              value={zoneCode}
              onChange={setZoneCode}
              disabled
            />
            <DaumPostCodeModal onComplete={handlePostCodeComplete} />
          </div>
          <InputWithLabel
            label="주소"
            name="address"
            placeholder="주소를 입력해주세요."
            value={address}
            onChange={setAddress}
            disabled
          />
          <InputWithLabel
            label="상세주소"
            name="addressDetail"
            placeholder="상세주소를 입력해주세요."
            value={addressDetail}
            onChange={setAddressDetail}
          />
          <InputWithLabel
            label="주소명"
            name="label"
            placeholder="집, 회사 등 주소명을 입력해주세요."
            value={label}
            onChange={setLabel}
          />
          <InputWithLabel
            label="수령인"
            name="recipientName"
            placeholder="이름을 입력해주세요."
            value={recipientName}
            onChange={setRecipientName}
          />
          <InputWithLabel
            label="휴대폰"
            name="recipientPhone"
            placeholder="숫자만 입력해주세요."
            type="tel"
            value={recipientPhone}
            onChange={setRecipientPhone}
          />
          {/* 수정 모드 & 기본 배송지가 아닌 경우에만 표시 */}
          {isEditMode && !editAddress?.isDefault && (
            <div className="flex px-4 items-center gap-1 self-stretch">
              <Label
                htmlFor="default-switch"
                className="flex w-20 px-1 items-center gap-2.5 text-base leading-4"
              >
                기본 배송지
              </Label>
              <div className="flex flex-1 py-2.5 px-2 items-center">
                <Switch
                  id="default-switch"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
              </div>
            </div>
          )}
        </div>
      </fetcher.Form>
    </Modal>
  );
}
