import { Minus, Plus, X } from "lucide-react";
import { Checkbox } from "~/common/components/ui/checkbox";
import type { CartItem } from "../queries";
import { isSkuOrderable, getSkuUnavailableLabel } from "~/features/products/status";

interface CartProductCardProps {
  item: CartItem;
  checked: boolean;
  onCheckChange: (checked: boolean) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  isUpdating?: boolean;
}

const stepButtonClass =
  "flex size-[30px] items-center justify-center rounded-full border-[1.3px] border-gray-200 bg-white text-gray-700 disabled:text-gray-300";

export default function CartProductCard({
  item,
  checked,
  onCheckChange,
  onQuantityChange,
  onRemove,
  isUpdating,
}: CartProductCardProps) {
  const { product, sku, quantity } = item;

  // 옵션 문자열 생성
  const optionText = sku.options
    ? Object.values(sku.options).join(" / ")
    : "옵션 없음";

  // 상품 금액
  const itemTotal = sku.salePrice * quantity;

  // 구매 가능 여부 — 항목 자체는 유지하되(참조 그룹) 구매 액션만 차단 (§3)
  const orderable = isSkuOrderable(product.status, sku);
  const unavailableLabel = getSkuUnavailableLabel(product.status, sku);

  return (
    <div className="relative flex gap-3 p-3.5 bg-white rounded-card shadow-card-sm">
      <Checkbox
        className="size-5 mt-0.5"
        id={`item-${item.id}`}
        checked={checked}
        disabled={!orderable}
        onCheckedChange={onCheckChange}
        aria-label={`${product.name} 선택`}
      />
      {product.mainImage ? (
        <img
          src={product.mainImage}
          alt={product.name}
          className="size-[72px] shrink-0 object-cover rounded-[14px] bg-gray-100"
        />
      ) : (
        <div className="size-[72px] shrink-0 rounded-[14px] bg-gray-100" />
      )}

      <div className="flex flex-1 min-w-0 flex-col gap-1.5 pr-5">
        <span className="text-[13.5px] font-semibold text-gray-900 truncate">
          {product.name}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-fit px-[9px] py-[3px] rounded-full bg-navy-50 text-[11px] font-bold text-primary">
            {optionText}
          </span>
          {unavailableLabel && (
            <span className="text-[11px] font-bold text-destructive">
              {unavailableLabel}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-0.5 -mr-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isUpdating || !orderable}
              className={stepButtonClass}
              aria-label="수량 빼기"
            >
              <Minus className="size-3" strokeWidth={2.4} />
            </button>
            <span className="min-w-4 text-center text-[13px] font-bold text-gray-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={quantity >= sku.stock || isUpdating || !orderable}
              className={stepButtonClass}
              aria-label="수량 더하기"
            >
              <Plus className="size-3" strokeWidth={2.4} />
            </button>
          </div>
          <div className="flex flex-col items-end">
            {sku.regularPrice > sku.salePrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {(sku.regularPrice * quantity).toLocaleString()}원
              </span>
            )}
            <span className="text-[14.5px] font-extrabold text-gray-900">
              {itemTotal.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={isUpdating}
        className="absolute top-2.5 right-2.5 p-0.5 text-gray-400 disabled:opacity-50"
        aria-label="삭제"
      >
        <X className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}
