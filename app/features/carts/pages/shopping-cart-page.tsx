import { useState } from "react";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Label } from "~/common/components/ui/label";
import CartProductCard from "../compoents/cart-product-card";
import Divider from "~/common/components/divider";
import RecommendProducts from "~/features/products/components/recommend-products";

export default function ShoppingCartPage() {
  const list = [];

  const [checkAll, setCheckAll] = useState<boolean>(false);

  return (
    <Content
      headerPorps={{ title: "장바구니", useRight: false }}
      footer={
        list.length > 0 && (
          <Button
            variant="secondary"
            className="flex w-full h-12.5 px-7.5 justify-center items-center rounded-full"
          >
            결제하기
          </Button>
        )
      }
    >
      {list.length > 0 ? (
        <>
          <div className="flex w-full p-4 items-center gap-2 border-b-1 border-b-muted/30">
            <div className="flex justify-end items-center gap-1.5">
              <Checkbox
                className="size-6"
                id="all"
                checked={checkAll}
                onClick={() => setCheckAll(!checkAll)}
              />
              <Label htmlFor="all" className="text-base leading-4 text-black">
                전체선택
              </Label>
            </div>
            <div className="flex justify-end items-center flex-gsb">
              <span className="text-xs leading-3">상품삭제</span>
            </div>
          </div>

          {Array.from({ length: 2 }).map(() => (
            <>
              <CartProductCard />
              <Divider />
            </>
          ))}

          <div className="flex w-full py-4.5 px-4 flex-col items-start gap-5">
            <div className="flex px-4 items-center gap-2.5 self-stretch">
              <span className="text-base font-bold leading-[100%] tracking-[-0.4px]">
                결제 예상 금액
              </span>
              <div className="flex justify-end items-center gap-2.5 flex-gsb self-stretch">
                <span className="text-sm font-bold leading-[100%] tracking-[-0.4px]">
                  146,000원
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center items-start gap-2.5 self-stretch">
              <div className="flex items-center gap-1 self-stretch">
                <div className="flex px-4 items-center gap-1 self-stretch">
                  <span className="text-sm leading-[140%] tracking-[-0.4px]">
                    상품 금액
                  </span>
                </div>
                <div className="flex px-4 justify-end items-center gap-1 flex-gsb self-stretch">
                  <span className="text-sm leading-[140%] tracking-[-0.4px]">
                    146,000원
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 self-stretch">
                <div className="flex px-4 items-center gap-1 self-stretch">
                  <span className="text-sm leading-[140%] tracking-[-0.4px]">
                    배송비
                  </span>
                </div>
                <div className="flex px-4 justify-end items-center gap-1 flex-gsb self-stretch">
                  <span className="text-sm leading-[140%] tracking-[-0.4px]">
                    0원
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-1 self-stretch">
              <div className="flex px-4 items-center gap-1 self-stretch">
                <span className="text-sm leading-[140%] tracking-[-0.4px]">
                  쿠폰 및 포인트는 결제 시 사용 가능합니다.
                </span>
              </div>
            </div>
          </div>
          <Divider />

          <div className="flex w-full py-4.5 px-4 flex-col items-start gap-5">
            <div className="flex px-4 items-center gap-2.5 self-stretch">
              <span className="text-base font-bold leading-[100%] tracking-[-0.4px]">
                총 결제 금액
              </span>
              <div className="flex justify-end items-center gap-2.5 flex-gsb self-stretch">
                <span className="text-lg font-bold leading-[100%] tracking-[-0.4px] text-accent">
                  146,000원
                </span>
              </div>
            </div>
          </div>
          <Divider />
        </>
      ) : (
        /* 장바구니 비어있을경우 start */
        <div className="flex flex-col w-full p-4 items-start gap-5">
          <div className="flex flex-col w-full h-48 justify-center items-center gap-4 rounded-md border-1 border-muted/30">
            <div className="flex justify-center items-center self-stretch">
              <span className="flex-gsb text-center text-base font-bold leading-5 tracking-[-0.4px]">
                장바구니가 비어 있어요
              </span>
            </div>
            <Button variant="secondary">쇼핑하기</Button>
          </div>
        </div>
        /* 장바구니 비어있을경우 end */
      )}

      <div className="flex pt-4 flex-col items-start gap-1">
        <RecommendProducts />
      </div>
    </Content>
  );
}
