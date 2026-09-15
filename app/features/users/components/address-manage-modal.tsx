import { useEffect, useState, useRef } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import Modal from "~/common/components/modal";
import { Button } from "~/common/components/ui/button";
import AddressList from "./address-list";
import AddressAddModal from "./address-add-modal";
import type { UserAddress } from "~/features/users/queries";
import { requestLocationFromNative } from "~/lib/native-bridge";
import { useAlert } from "~/hooks/useAlert";

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
  const [prefillAddress, setPrefillAddress] = useState<{
    zoneCode: string;
    address: string;
  } | null>(null);
  const hasLoadedRef = useRef(false);
  const { alert } = useAlert();

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

  const handleFindByLocation = async () => {
    try {
      const { lat, lng } = await requestLocationFromNative();
      const response = await fetch(
        `/users/addresses/reverse-geocode?lat=${lat}&lng=${lng}`
      );
      const data = await response.json();

      if (!data.success) {
        if (data.error === "NO_RESULT") {
          toast.error("현재 위치의 주소를 찾을 수 없어요. 직접 검색해주세요.");
        } else {
          toast.error("주소를 찾는 중 오류가 발생했어요. 다시 시도해주세요.");
        }
        return;
      }

      setPrefillAddress({ zoneCode: data.zoneCode, address: data.address });
      setAddModalOpen(true);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "";
      if (reason === "PERMISSION_DENIED") {
        alert({
          title: "위치 권한이 필요해요",
          message: "설정에서 위치 접근 권한을 허용해주세요.",
          primaryButton: { label: "확인", onClick: () => {} },
        });
      } else {
        // NATIVE_UNAVAILABLE(네이티브 앱이 아니거나 응답이 없음) 등
        alert({
          title: "이용할 수 없는 기능이에요",
          message: "앱에서만 이용할 수 있는 기능이에요.",
          primaryButton: { label: "확인", onClick: () => {} },
        });
      }
    }
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
          setPrefillAddress(null);
        }}
        onSuccess={handleAddSuccess}
        editAddress={editAddress}
        initialAddress={prefillAddress}
      />
    </>
  );
}
