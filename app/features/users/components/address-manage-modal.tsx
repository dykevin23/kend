import { useEffect, useState, useRef } from "react";
import { useFetcher } from "react-router";
import Modal from "~/common/components/modal";
import { Button } from "~/common/components/ui/button";
import AddressList from "./address-list";
import AddressAddModal from "./address-add-modal";
import type { UserAddress } from "~/features/users/queries";

interface AddressManageModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (address: UserAddress) => void;
  currentAddressId?: string;
}

export default function AddressManageModal({
  open,
  onClose,
  onSelect,
  currentAddressId,
}: AddressManageModalProps) {
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
        <div className="flex flex-col w-full min-h-80 px-4 pb-4">
          <AddressList
            addresses={addresses}
            isLoading={isLoading}
            selectable
            currentAddressId={currentAddressId}
            onSelect={handleSelectAddress}
            onEdit={handleEditAddress}
            showLocationButton
            onFindByLocation={handleFindByLocation}
          />
        </div>
      </Modal>

      {/* 주소 추가/수정 모달 */}
      <AddressAddModal
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
