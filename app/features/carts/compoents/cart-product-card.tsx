import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { productSample2 } from "~/assets/images";
import { Badge } from "~/common/components/ui/badge";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Label } from "~/common/components/ui/label";

export default function CartProductCard() {
  const [item1Chk, setItem1Chk] = useState<boolean>(false);
  return (
    <div className="flex w-full flex-col pt-4.5 px-4 pb-4 items-start gap-4">
      <div className="flex items-center gap-2.5 self-stretch">
        <Checkbox
          className="size-6"
          id="item1"
          checked={item1Chk}
          onClick={() => setItem1Chk(!item1Chk)}
        />
        <Label htmlFor="item1" className="text-base leading-4 text-black">
          KEND KID
        </Label>
      </div>
      <div className="flex flex-col items-center self-stretch rounded-md border-1 border-muted/30">
        <div className="flex flex-col w-full px-4 items-center gap-2.5 self-stretch rounded-md">
          <div className="flex flex-col w-full justify-center items-start">
            <div className="flex w-full py-2.5 items-center gap-2.5">
              <div className="flex size-20 justify-center items-center shrink-0">
                <img src={productSample2} />
              </div>
              <div className="flex flex-1 flex-col pr-2.5 items-start gap-2 shrink-0 self-stretch">
                <div className="flex w-full justify-end items-start self-stretch">
                  <X className="size-3 aspect-square" />
                </div>
                <div className="flex w-full justify-end items-start self-stretch">
                  <span className="text-xs leading-[125%] tracking-[-0.4px] flex-gsb">
                    [신상] 엄청 엄청 엄청 매우 따뜻한 구스 다운 패딩 기모,
                    모자/안감 탈부착, 블랙, 화이트, 베이지,
                  </span>
                </div>
                <div className="flex h-8 px-2.5 items-center gap-1 self-stretch rounded-xs bg-secondary/10">
                  <span className="text-center text-xs leading-[140%] tracking-[-0.4px]">
                    베이지 / 24 M
                  </span>
                  <Badge className="flex py-0.25 px-0.75 flex-col items-start bg-accent rounded-xs">
                    추천 사이즈
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col py-2.5 px-4 justify-center items-start gap-2.5 self-stretch">
              <div className="flex w-full items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
                    700,000원
                  </span>
                  <span className="text-[10px] leading-[100%] tracking-[-0.4px] line-through text-muted">
                    1,000,000원
                  </span>
                </div>
                <div className="flex-1 h-6 justify-end items-center gap-4">
                  <div className="flex h-6 px-2.5 justify-end items-center gap-4">
                    <Minus className="size-3" />
                    <div className="flex h-3 justify-center items-center">
                      <span className="text-center text-base leading-[100%] tracking-[-0.4px]">
                        1
                      </span>
                    </div>
                    <Plus className="size-3" />
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
              상품 금액 700,000원 + 배송비 3,000원 =
            </span>
            <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
              703,000원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
