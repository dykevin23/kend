import { useEffect, useState, useRef } from "react";
import { useFetcher } from "react-router";
import { MapPin, Pencil } from "lucide-react";
import Modal from "~/common/components/modal";
import { Button } from "~/common/components/ui/button";
import { Badge } from "~/common/components/ui/badge";
import DeliveryAddressAddModal from "./delivery-address-add-modal";
import type { UserAddress } from "~/features/users/queries";

interface DeliveryAddressManageModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (address: UserAddress) => void;
  currentAddressId?: string;
}

export default function DeliveryAddressManageModal({
  open,
  onClose,
  onSelect,
  currentAddressId,
}: DeliveryAddressManageModalProps) {
  const fetcher = useFetcher<{ addresses: UserAddress[] }>();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<UserAddress | null>(null);
  const hasLoadedRef = useRef(false);

  // 모달이 열릴 때 주소 목록 로드
  useEffect(() => {
    if (open && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetcher.load("/users/addresses");
    }
    // 모달이 닫히면 리셋
    if (!open) {
      hasLoadedRef.current = false;
    }
  }, [open]);

  // 주소 추가 성공 시 목록 새로고침
  const handleAddSuccess = () => {
    fetcher.load("/users/addresses");
  };

  const handleSelectAddress = (address: UserAddress) => {
    onSelect(address);
    onClose();
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditAddress(address);
    setAddModalOpen(true);
  };

  const handleFindByLocation = () => {
    // TODO: 현재 위치로 주소 찾기 (Native 기능)
    console.log("Find by location");
  };

  const addresses = fetcher.data?.addresses ?? [];
  const isLoading = fetcher.state === "loading";

  return (
    <>
      <Modal
        open={open}
        title="배송지관리"
        onClose={onClose}
        footer={
          <Button
            type="button"
            variant="secondary"
            className="flex w-full h-12.5 rounded-full"
            onClick={() => setAddModalOpen(true)}
          >
            주소지 추가
          </Button>
        }
      >
        <div className="flex flex-col w-full min-h-80">
          {/* 현재 위치로 주소 찾기 버튼 */}
          <div className="px-4 py-3">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-12 rounded-lg border-muted/30"
              onClick={handleFindByLocation}
            >
              <MapPin className="size-5" />
              <span>현재 위치로 주소 찾기</span>
            </Button>
          </div>

          {/* 주소 목록 */}
          <div className="flex-1 px-4 pb-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <span className="text-sm text-muted">불러오는 중...</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <span className="text-sm text-muted">
                  등록된 배송지가 없습니다.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map((address) => (
                  <AddressItem
                    key={address.id}
                    address={address}
                    isSelected={address.id === currentAddressId}
                    onSelect={() => handleSelectAddress(address)}
                    onEdit={() => handleEditAddress(address)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* 주소 추가/수정 모달 */}
      <DeliveryAddressAddModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditAddress(null);
        }}
        onSuccess={handleAddSuccess}
        editAddress={editAddress}
      />
    </>
  );
}

interface AddressItemProps {
  address: UserAddress;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

function AddressItem({
  address,
  isSelected,
  onSelect,
  onEdit,
}: AddressItemProps) {
  const fullAddress = `${address.address}${address.addressDetail ? `, ${address.addressDetail}` : ""} [${address.zoneCode}]`;

  return (
    <div
      className={`flex items-start justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? "border-secondary bg-secondary/5"
          : "border-muted/30 hover:border-muted/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold leading-4 tracking-[-0.4px]">
            {address.label}
          </span>
          {address.isDefault && <Badge>기본</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm leading-3.5 tracking-[-0.4px]">
            {address.recipientName}
          </span>
          <span className="text-muted/50">·</span>
          <span className="text-sm leading-3.5 tracking-[-0.4px] text-muted">
            {address.recipientPhone}
          </span>
        </div>
        <span className="text-sm leading-4 tracking-[-0.4px] text-muted truncate">
          {fullAddress}
        </span>
      </div>
      <button
        type="button"
        className="p-2 rounded-full hover:bg-muted/10 transition-colors shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        <Pencil className="size-4 text-muted" />
      </button>
    </div>
  );
}
