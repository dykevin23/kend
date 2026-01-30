import { Minus, Plus, X } from "lucide-react";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Label } from "~/common/components/ui/label";
import type { CartItem } from "../queries";

interface CartProductCardProps {
  item: CartItem;
  checked: boolean;
  onCheckChange: (checked: boolean) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  isUpdating?: boolean;
}

export default function CartProductCard({
  item,
  checked,
  onCheckChange,
  onQuantityChange,
  onRemove,
  isUpdating,
}: CartProductCardProps) {
  const { product, sku, seller, quantity } = item;

  // 옵션 문자열 생성
  const optionText = sku.options
    ? Object.values(sku.options).join(" / ")
    : null;

  // 상품 금액
  const itemTotal = sku.salePrice * quantity;

  return (
    <div className="flex w-full flex-col pt-4.5 px-4 pb-4 items-start gap-4">
      <div className="flex items-center gap-2.5 self-stretch">
        <Checkbox
          className="size-6"
          id={`item-${item.id}`}
          checked={checked}
          onCheckedChange={onCheckChange}
        />
        <Label
          htmlFor={`item-${item.id}`}
          className="text-base leading-4 text-black"
        >
          {seller?.name ?? "판매자"}
        </Label>
      </div>
      <div className="flex flex-col items-center self-stretch rounded-md border-1 border-muted/30">
        <div className="flex flex-col w-full px-4 items-center gap-2.5 self-stretch rounded-md">
          <div className="flex flex-col w-full justify-center items-start">
            <div className="flex w-full py-2.5 items-center gap-2.5">
              <div className="flex size-20 justify-center items-center shrink-0">
                {product.mainImage ? (
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="size-full object-cover rounded"
                  />
                ) : (
                  <div className="size-full bg-gray-200 rounded" />
                )}
              </div>
              <div className="flex flex-1 flex-col pr-2.5 items-start gap-2 shrink-0 self-stretch">
                <div className="flex w-full justify-end items-start self-stretch">
                  <button
                    onClick={onRemove}
                    disabled={isUpdating}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <X className="size-3 aspect-square" />
                  </button>
                </div>
                <div className="flex w-full justify-end items-start self-stretch">
                  <span className="text-xs leading-[125%] tracking-[-0.4px] flex-gsb line-clamp-2">
                    {product.name}
                  </span>
                </div>
                {optionText && (
                  <div className="flex h-8 px-2.5 items-center gap-1 self-stretch rounded-xs bg-secondary/10">
                    <span className="text-center text-xs leading-[140%] tracking-[-0.4px]">
                      {optionText}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col py-2.5 px-4 justify-center items-start gap-2.5 self-stretch">
              <div className="flex w-full items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
                    {sku.salePrice.toLocaleString()}원
                  </span>
                  {sku.regularPrice > sku.salePrice && (
                    <span className="text-[10px] leading-[100%] tracking-[-0.4px] line-through text-muted">
                      {sku.regularPrice.toLocaleString()}원
                    </span>
                  )}
                </div>
                <div className="flex-1 h-6 justify-end items-center gap-4">
                  <div className="flex h-6 px-2.5 justify-end items-center gap-4">
                    <button
                      onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isUpdating}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <Minus className="size-3" />
                    </button>
                    <div className="flex h-3 justify-center items-center min-w-6">
                      <span className="text-center text-base leading-[100%] tracking-[-0.4px]">
                        {quantity}
                      </span>
                    </div>
                    <button
                      onClick={() => onQuantityChange(quantity + 1)}
                      disabled={quantity >= sku.stock || isUpdating}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full px-4 pb-4 flex-col justify-center items-start">
          <div className="flex w-full h-3.5 items-center border-t-1 border-muted/30"></div>
          <div className="flex w-full h-3.5 justify-center items-center">
            <span className="text-center text-xs leading-[100%] tracking-[-0.4px] text-muted/50">
              상품 금액 {itemTotal.toLocaleString()}원
            </span>
            <span className="text-sm font-bold leading-[100%] tracking-[-0.4px] ml-1">
              {itemTotal.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
