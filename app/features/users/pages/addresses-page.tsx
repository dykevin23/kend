import { useState, useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import AddressList from "../components/address-list";
import AddressAddModal from "../components/address-add-modal";
import type { UserAddress } from "../queries";

export default function AddressesPage() {
  const fetcher = useFetcher<{ addresses: UserAddress[] }>();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<UserAddress | null>(null);
  const hasLoadedRef = useRef(false);

  // 페이지 로드 시 주소 목록 로드
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetcher.load("/users/addresses");
    }
  }, []);

  // 주소 추가/수정 성공 시 목록 새로고침
  const handleSuccess = () => {
    fetcher.load("/users/addresses");
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditAddress(address);
    setAddModalOpen(true);
  };

  const handleAddClick = () => {
    setEditAddress(null);
    setAddModalOpen(true);
  };

  const addresses = fetcher.data?.addresses ?? [];
  const isLoading = fetcher.state === "loading";

  return (
    <Content
      headerPorps={{ title: "배송지 관리", useRight: false }}
      footer={
        <Button
          type="button"
          variant="secondary"
          className="flex w-full h-12.5 rounded-full"
          onClick={handleAddClick}
        >
          배송지 추가
        </Button>
      }
    >
      <div className="flex flex-col w-full px-4 py-4">
        <AddressList
          addresses={addresses}
          isLoading={isLoading}
          onEdit={handleEditAddress}
        />
      </div>

      {/* 주소 추가/수정 모달 */}
      <AddressAddModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditAddress(null);
        }}
        onSuccess={handleSuccess}
        editAddress={editAddress}
      />
    </Content>
  );
}
