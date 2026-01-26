import { productSample2 } from "~/assets/images";
import Modal from "~/common/components/modal";
import { Button } from "~/common/components/ui/button";
import DeliveryAddress from "./delivery-address";

interface ProductPurchaseModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProductPurchaseModal({
  open,
  onClose,
}: ProductPurchaseModalProps) {
  return (
    <Modal
      open={open}
      title="결제"
      onClose={onClose}
      footer={
        <Button variant="secondary" className="flex w-full h-12.5 rounded-full">
          결제하기
        </Button>
      }
    >
      <DeliveryAddress address="123" />

      <div className="flex w-full flex-col pt-5.5 pb-4 px-4 items-start gap-5 bg-white">
        <div className="flex px-4 items-center gap-2.5 self-stretch">
          <span className="text-lg font-bold leading-4.5 tracking-[-0.4px]">
            주문 상품
          </span>
          <div className="flex items-center gap-2 self-stretch">
            <span className="text-sm text-muted">2개</span>
          </div>
        </div>

        <div className="flex flex-col items-center self-stretch rounded-lg border-1 border-muted/30">
          <div className="flex flex-col items-center gap-2.5 self-stretch rounded-lg">
            <div className="flex w-full pt-2.5 px-4 items-center gap-1 border-b-1 border-b-muted/30">
              <span className="text-base font-bold leading-4 tracking-[-0.4px]">
                KEND KID
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="2"
                height="24"
                viewBox="0 0 2 24"
                fill="none"
              >
                <path
                  d="M1 18.5L1 4.5"
                  stroke="#939393"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex gap-2 items-center self-stretch">
                <span className="text-muted">1개</span>
              </div>
              <div className="flex h-7 justify-end items-center gap-2 flex-gsb">
                <span className="text-muted">
                  배송비 <span className="text-black">3,000원</span>
                </span>
              </div>
            </div>
            <div className="flex w-full px-4 items-center gap-2.5">
              <div className="flex size-19 justify-center items-center shrink-0">
                <img src={productSample2} alt="" />
              </div>
              <div className="flex w-60 flex-col items-start gap-2 shrink-0 self-stretch">
                <div className="flex items-center self-stretch">
                  <span className="text-xs leading-3.5 tracking-[-0.4px]">
                    [신상] 엄청 엄청 엄청 매우 따뜻한 구스 다운 패딩(기모,
                    모자/안감 탈부착, 블랙, 화이트, 베이지, 사이즈 12 M...
                  </span>
                </div>
                <div className="flex items-center self-stretch">
                  <span className="text-xs leading-3 tracking-[-0.4px] text-muted">
                    09.05(금) 이내 발송 예정
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full px-4 items-center">
              <div className="flex w-full h-8 pl-2.5 items-center gap-1 self-stretch rounded-xs bg-secondary/10">
                <span className="text-xs leading-4 tracking-[-0.4px]">
                  베이지 / 24 M
                </span>
                <div className="flex flex-col py-0.25 px-0.75 items-start bg-accent rounded-xs">
                  <span className="text-xs leading-3 tracking-[-0.4px] text-white">
                    추천 사이즈
                  </span>
                </div>
                <div className="flex py-0.25 px-5 flex-col justify-center items-end flex-gsb">
                  <span className="text-xs leading-3 tracking-[-0.4px]">
                    1개
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full px-4 flex-col py-2.5 justify-center items-start gap-2.5">
              <div className="flex w-full h-3.5 items-center justify-between">
                <span className="text-xs leading-3 tracking-[-0.4px] text-muted">
                  결제 금액
                </span>
                <div className="flex-gsb text-right">
                  <span className=" text-sm font-bold leading-3.5 tracking-[-0.4px]">
                    700,000원
                  </span>
                </div>
              </div>
              <div className="flex w-full h-3.5 items-center justify-between">
                <span className="text-xs leading-3 tracking-[-0.4px] text-muted">
                  쿠폰 할인
                </span>
                <div className="flex-gsb text-right">
                  <span className="text-sm font-bold leading-3.5 tracking-[-0.4px] text-accent">
                    -1,000원
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4 flex flex-col w-full justify-center items-start">
            <div className="flex w-full h-3 items-center border-t-1 border-t-muted/30"></div>
            <div className="flex w-full h-3 items-center">
              <span className="text-sm font-bold leading-3 tracking-[-0.4px]">
                최종 결제 금액
              </span>
              <span className="text-right flex-gsb text-base font-bold leading-4 tracking-[-0.4px]">
                690,000원
              </span>
            </div>
          </div>
        </div>

        <div className="flex px-4 w-full items-center self-stretch">
          <span className="flex-gsb font-xs leading-3 tracking-[-0.4px] text-muted/50">
            판매자 배송 상품을 여러개 구매한 경우, 구매한 상품은 함께 배송될수
            있으며 늦발송이 늦어질수 있습니다.
          </span>
        </div>
      </div>
    </Modal>
  );
}
