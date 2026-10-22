import { Button } from "~/common/components/ui/button";
import AddressAddModal from "~/features/users/components/address-add-modal";
import AddressManageModal from "~/features/users/components/address-manage-modal";
import { useState } from "react";
import { Badge } from "~/common/components/ui/badge";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import { Input } from "~/common/components/ui/input";
import type { UserAddress } from "~/features/users/queries";

/**
 * 배송 메시지 옵션
 */
const DELIVERY_MESSAGE_OPTIONS = [
  { value: "none", label: "선택 안함" },
  { value: "문 앞에 놔주세요", label: "문 앞에 놔주세요" },
  { value: "부재 시 연락주세요", label: "부재 시 연락주세요" },
  { value: "배송 전 미리 연락해 주세요", label: "배송 전 미리 연락해 주세요" },
  { value: "custom", label: "직접 입력하기" },
];

interface DeliveryAddressProps {
  address: UserAddress | null;
  onAddressChange?: (address: UserAddress) => void;
  deliveryMessageOption: string;
  onDeliveryMessageOptionChange: (value: string) => void;
  customDeliveryMessage: string;
  onCustomDeliveryMessageChange: (value: string) => void;
}

export default function DeliveryAddress({
  address,
  onAddressChange,
  deliveryMessageOption,
  onDeliveryMessageOptionChange,
  customDeliveryMessage,
  onCustomDeliveryMessageChange,
}: DeliveryAddressProps) {
  const [addressAddModalOpen, setAddressAddModalOpen] =
    useState<boolean>(false);
  const [addressManageModalOpen, setAddressManageModalOpen] =
    useState<boolean>(false);

  const handleSelectAddress = (selectedAddress: UserAddress) => {
    onAddressChange?.(selectedAddress);
  };

  // 주소 전체 문자열 생성
  const fullAddress = address
    ? `${address.address}${address.addressDetail ? `, ${address.addressDetail}` : ""} [${address.zoneCode}]`
    : "";

  return (
    <>
      <div className="flex w-full flex-col gap-2.5 p-4 bg-white rounded-card shadow-card-sm">
        <div className="flex items-center justify-between">
          <span className="text-[14.5px] font-extrabold text-gray-900">배송지</span>
          {address && (
            <button
              type="button"
              className="text-[12.5px] font-bold text-primary"
              onClick={() => setAddressManageModalOpen(true)}
            >
              변경
            </button>
          )}
        </div>
        {address ? (
          <>
            <div className="flex items-start gap-2">
              <MapPin className="size-4 mt-0.5 shrink-0 text-primary" strokeWidth={2} />
              <div className="flex flex-col gap-[3px] min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[13.5px] font-bold text-gray-900">
                    {address.recipientName}
                  </span>
                  <span className="text-xs text-gray-500">{address.recipientPhone}</span>
                  {address.isDefault && <Badge variant="secondary">기본</Badge>}
                </div>
                <span className="text-[13px] leading-normal text-gray-700">
                  {address.label && `[${address.label}] `}
                  {fullAddress}
                </span>
              </div>
            </div>
            <div className="h-px my-0.5 bg-gray-100" />
            <Select
              value={deliveryMessageOption}
              onValueChange={onDeliveryMessageOptionChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="배송 메시지를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_MESSAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {deliveryMessageOption === "custom" && (
              <Input
                placeholder="배송 메시지를 입력하세요"
                value={customDeliveryMessage}
                onChange={(e) => onCustomDeliveryMessageChange(e.target.value)}
                className="w-full h-11"
                maxLength={50}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <span className="text-sm text-gray-500">등록된 배송 주소가 없습니다.</span>
            <Button onClick={() => setAddressAddModalOpen(true)}>
              배송 주소 추가
            </Button>
          </div>
        )}
      </div>

      <AddressAddModal
        open={addressAddModalOpen}
        onClose={() => setAddressAddModalOpen(false)}
      />

      <AddressManageModal
        open={addressManageModalOpen}
        onClose={() => setAddressManageModalOpen(false)}
        onSelect={handleSelectAddress}
        currentAddressId={address?.id}
      />
    </>
  );
}
