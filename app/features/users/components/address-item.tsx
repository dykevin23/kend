import { Pencil } from "lucide-react";
import { Badge } from "~/common/components/ui/badge";
import type { UserAddress } from "~/features/users/queries";

interface AddressItemProps {
  address: UserAddress;
  isSelected?: boolean;
  selectable?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
}

export default function AddressItem({
  address,
  isSelected = false,
  selectable = false,
  onSelect,
  onEdit,
}: AddressItemProps) {
  const fullAddress = `${address.address}${address.addressDetail ? `, ${address.addressDetail}` : ""} [${address.zoneCode}]`;

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect();
    }
  };

  return (
    <div
      className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
        isSelected
          ? "border-secondary bg-secondary/5"
          : "border-muted/30 hover:border-muted/50"
      } ${selectable ? "cursor-pointer" : ""}`}
      onClick={handleClick}
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
      {onEdit && (
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
      )}
    </div>
  );
}
