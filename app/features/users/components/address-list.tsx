import { MapPin } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import AddressItem from "./address-item";
import type { UserAddress } from "~/features/users/queries";

interface AddressListProps {
  addresses: UserAddress[];
  isLoading?: boolean;
  /** 선택 모드 (모달에서 사용) */
  selectable?: boolean;
  /** 현재 선택된 주소 ID */
  currentAddressId?: string;
  /** 주소 선택 시 콜백 */
  onSelect?: (address: UserAddress) => void;
  /** 주소 수정 시 콜백 */
  onEdit?: (address: UserAddress) => void;
  /** 현재 위치로 찾기 버튼 표시 여부 */
  showLocationButton?: boolean;
  /** 현재 위치로 찾기 클릭 시 콜백 */
  onFindByLocation?: () => void;
}

export default function AddressList({
  addresses,
  isLoading = false,
  selectable = false,
  currentAddressId,
  onSelect,
  onEdit,
  showLocationButton = false,
  onFindByLocation,
}: AddressListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-sm text-muted">불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* 현재 위치로 주소 찾기 버튼 */}
      {showLocationButton && (
        <div className="py-3">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-12 rounded-lg border-muted/30"
            onClick={onFindByLocation}
          >
            <MapPin className="size-5" />
            <span>현재 위치로 주소 찾기</span>
          </Button>
        </div>
      )}

      {/* 주소 목록 */}
      {addresses.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <span className="text-sm text-muted">등록된 배송지가 없습니다.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <AddressItem
              key={address.id}
              address={address}
              isSelected={selectable && address.id === currentAddressId}
              selectable={selectable}
              onSelect={onSelect ? () => onSelect(address) : undefined}
              onEdit={onEdit ? () => onEdit(address) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
