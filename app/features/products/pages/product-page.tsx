import { useEffect, useState } from "react";
import { productSample1, productSample2 } from "~/assets/images";
import BottomSheet from "~/common/components/bottom-sheet";
import Content from "~/common/components/content";
import Modal from "~/common/components/modal";
import { SelectAccordion } from "~/common/components/select-accordion";
import { Tab, Tabs } from "~/common/components/tabs";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import DeliveryAddress from "../components/delivery-address";

export default function ProductPage() {
  const [isActiveTab, setIsActiveTab] = useState<string>("home");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpen2, setIsOpen2] = useState<boolean>(false);
  const [buyOption, setBuyOption] = useState<{ [key: string]: string }>({});

  const handleClickTab = (key: string) => () => {
    setIsActiveTab(key);
  };

  const handleBuy = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(true);
  };

  const handleChangeBuyOption = (value: string, parent: string) => {
    setBuyOption((prev) => {
      return Object.assign({}, prev, { [parent]: value });
    });
  };

  useEffect(() => {
    console.log(
      "### buyOption => ",
      buyOption,
      Object.keys(buyOption),
      Object.values(buyOption)
    );
  }, [buyOption]);

  return (
    <>
      <Content>
        <div className="w-full h-94 shrink-0 aspect-square bg-gray-400"></div>

        <div className="flex pt-3 px-4 flex-col justify-center items-start gap-4 self-stretch">
          <span className="text-xl font-bold leading-7.5 tracking-[-0.4px]">
            [신상] 엄청 엄청 엄청 매우 따뜻한 구스 다운 패딩(기모, 모자/안감
            탈부착, 블랙, 화...
          </span>

          <div className="flex h-6 items-start gap-2 self-stretch border-b-1 border-b-muted/30">
            <div className="flex items-center gap-1 flex-gsb self-stretch">
              <div className="flex items-center gap-0.5">
                <div className="flex h-3.5 pl-0.5 justify-end items-center aspect-square">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="14"
                    viewBox="0 0 12 14"
                    fill="none"
                  >
                    <path
                      d="M6.01246 4.21171C6.387 3.27798 6.57427 2.81111 6.87853 2.7464C6.95853 2.72939 7.04121 2.72939 7.12121 2.7464C7.42547 2.81111 7.61274 3.27798 7.98728 4.21171C8.20028 4.74271 8.30678 5.0082 8.50605 5.18878C8.56194 5.23944 8.62262 5.28455 8.68722 5.32348C8.91754 5.4623 9.20506 5.48805 9.7801 5.53955C10.7535 5.62673 11.2403 5.67032 11.3889 5.94784C11.4197 6.00531 11.4406 6.06754 11.4508 6.13194C11.5001 6.44287 11.1423 6.76841 10.4267 7.41948L10.2279 7.60028C9.89337 7.90466 9.72608 8.05686 9.62932 8.24679C9.57128 8.36073 9.53236 8.48343 9.51413 8.60999C9.48373 8.82098 9.53271 9.04176 9.63069 9.48334L9.66569 9.64111C9.84139 10.433 9.92924 10.8289 9.81957 11.0236C9.72107 11.1984 9.53963 11.3103 9.33919 11.3199C9.11606 11.3305 8.80165 11.0743 8.17283 10.5619C7.75854 10.2244 7.55139 10.0556 7.32144 9.98963C7.11129 9.92937 6.88845 9.92937 6.6783 9.98963C6.44835 10.0556 6.2412 10.2244 5.82691 10.5619C5.19809 11.0743 4.88368 11.3305 4.66055 11.3199C4.46011 11.3103 4.27867 11.1984 4.18017 11.0236C4.0705 10.8289 4.15835 10.433 4.33405 9.64111L4.36905 9.48334C4.46703 9.04176 4.51601 8.82098 4.48561 8.60999C4.46738 8.48343 4.42846 8.36073 4.37042 8.24679C4.27366 8.05686 4.10638 7.90467 3.77181 7.60028L3.57308 7.41948C2.85746 6.76841 2.49964 6.44287 2.54892 6.13194C2.55912 6.06754 2.58005 6.00531 2.61084 5.94784C2.75947 5.67032 3.24619 5.62673 4.21964 5.53955C4.79468 5.48805 5.0822 5.4623 5.31252 5.32348C5.37712 5.28455 5.4378 5.23944 5.49369 5.18878C5.69297 5.0082 5.79946 4.74271 6.01246 4.21171Z"
                      fill="#EBABF8"
                    />
                  </svg>
                </div>
                <span className="text-xs leading-3 text-muted">4.6</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="2"
                height="2"
                viewBox="0 0 2 2"
                fill="none"
              >
                <circle cx="1" cy="1" r="1" fill="#BCC2CF" />
              </svg>
              <span className="text-xs leading-3 text-muted">리뷰 (4,321)</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-2.5 shrink-0">
          <Tabs>
            <Tab
              title="홈"
              isActive={isActiveTab === "home"}
              className={{ "text-muted": isActiveTab !== "home" }}
              onClick={handleClickTab("home")}
            />
            <Tab
              title="패션"
              isActive={isActiveTab === "fashion"}
              className={{ "text-muted": isActiveTab !== "fashion" }}
              onClick={handleClickTab("fashion")}
            />
            <Tab
              title="스킨케어"
              isActive={isActiveTab === "skincare"}
              className={{ "text-muted": isActiveTab !== "skincare" }}
              onClick={handleClickTab("skincare")}
            />
            <Tab
              title="액티비티"
              isActive={isActiveTab === "activity"}
              className={{ "text-muted": isActiveTab !== "activity" }}
              onClick={handleClickTab("activity")}
            />
            <Tab
              title="라이프"
              isActive={isActiveTab === "life"}
              className={{ "text-muted": isActiveTab !== "life" }}
              onClick={handleClickTab("life")}
            />
          </Tabs>

          <div className="flex flex-col justify-center items-center gap-2.5 self-stretch">
            <img className="w-full" src={productSample1} alt="" />
          </div>
        </div>

        <div className="flex w-full h-18 p-4 justify-center items-center gap-1.5 shrink-0 border-t-1 border-t-muted fixed bottom-0 bg-white">
          <div className="flex flex-col justify-center items-start gap-1 flex-gsb">
            <div
              className={cn(
                "flex h-3.5 gap-1 self-stretch",
                "text-sm leading-3.5 tracking-[-0.4px]"
              )}
            >
              <span>30%</span>
              <span className="text-muted line-through">1,000,000</span>
            </div>
            <div className="flex h-5 flex-col justify-center items-start gap-1 self-stretch">
              <span className="text-xl font-bold leading-4 tracking-[-0.4px]">
                700,000원
              </span>
            </div>
            <div className="flex h-5 pr-4 justify-center items-center gap-0.25">
              <div className="flex w-37 shrink-0 self-stretch">
                <span className="text-xl font-bold leading-5 tracking-[-0.4px] text-accent">
                  690,000원
                </span>
                <div className="flex items-end">
                  <span className="text-xs font-bold leading-3 tracking-[-0.4px] text-accent">
                    쿠폰할인가
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex size-12 px-4 justify-center items-center gap-2.5 shrink-0 rounded-full bg-secondary/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="aspect-square shrink-0"
            >
              <path
                d="M20.1766 4.90686C19.1163 3.82835 17.7108 3.17009 16.2139 3.05098C14.7171 2.93188 13.2276 3.35978 12.0145 4.2574C10.7419 3.29704 9.15781 2.86157 7.58133 3.03867C6.00486 3.21578 4.55308 3.99231 3.51835 5.21189C2.48362 6.43147 1.9428 8.00351 2.0048 9.61143C2.06679 11.2194 2.727 12.7437 3.85246 13.8776L10.064 20.1896C10.5842 20.7089 11.2847 21 12.0145 21C12.7443 21 13.4449 20.7089 13.965 20.1896L20.1766 13.8776C21.3445 12.6855 22 11.073 22 9.39223C22 7.71146 21.3445 6.09897 20.1766 4.90686ZM18.7663 12.4772L12.5547 18.779C12.484 18.8514 12.3999 18.9089 12.3072 18.9481C12.2144 18.9874 12.115 19.0076 12.0145 19.0076C11.9141 19.0076 11.8146 18.9874 11.7219 18.9481C11.6292 18.9089 11.5451 18.8514 11.4744 18.779L5.26282 12.4467C4.47838 11.6332 4.03912 10.5404 4.03912 9.40237C4.03912 8.26432 4.47838 7.17152 5.26282 6.35801C6.06218 5.55733 7.14027 5.10837 8.26359 5.10837C9.3869 5.10837 10.465 5.55733 11.2643 6.35801C11.3573 6.45312 11.468 6.52862 11.5899 6.58014C11.7117 6.63166 11.8425 6.65818 11.9745 6.65818C12.1066 6.65818 12.2373 6.63166 12.3592 6.58014C12.4811 6.52862 12.5917 6.45312 12.6847 6.35801C13.4841 5.55733 14.5622 5.10837 15.6855 5.10837C16.8088 5.10837 17.8869 5.55733 18.6862 6.35801C19.4815 7.16086 19.9351 8.24774 19.9501 9.38582C19.9651 10.5239 19.5401 11.6227 18.7663 12.4467V12.4772Z"
                fill="black"
              />
            </svg>
          </div>
          <Button variant="secondary" size="lg" onClick={handleBuy}>
            구매하기
          </Button>
        </div>
      </Content>

      <BottomSheet open={isOpen}>
        <SelectAccordion
          items={[
            {
              triggerLabel: "색상",
              value: "color",
              options: [
                {
                  label: (
                    <>
                      <div className="size-6 rounded-md border-2 bg-white" />
                      <span className="text-base leading-5.5 tracking-[-0.4px]">
                        화이트
                      </span>
                    </>
                  ),
                  value: "white",
                },
                {
                  label: (
                    <>
                      <div className="size-6 rounded-md border-2 bg-black" />
                      <span className="text-base leading-5.5 tracking-[-0.4px]">
                        블랙
                      </span>
                    </>
                  ),
                  value: "black",
                },
                {
                  label: (
                    <>
                      <div className="size-6 rounded-md border-2 bg-red-500" />
                      <span className="text-base leading-5.5 tracking-[-0.4px]">
                        레드
                      </span>
                    </>
                  ),
                  value: "red",
                },
              ],
            },
            {
              triggerLabel: "SIZE",
              value: "size",
              options: [
                { label: "small", value: "small" },
                { label: "medium", value: "medium" },
                { label: "large", value: "large" },
              ],
            },
          ]}
          values={buyOption}
          onChange={handleChangeBuyOption}
        />

        {Object.keys(buyOption).length > 0 &&
          !Object.values(buyOption).includes("") && (
            <div className="flex w-full h-18 py-4 justify-center items-center gap-1.5 shrink-0">
              <Button className="flex w-full h-12 px-7.5 justify-center items-center gap-2.5 flex-gsb ">
                장바구니
              </Button>
              <Button
                variant="secondary"
                className="flex w-full h-12 px-7.5 justify-center items-center gap-2.5 flex-gsb "
                onClick={() => setIsOpen2(true)}
              >
                바로 구매
              </Button>
            </div>
          )}
      </BottomSheet>

      <Modal
        open={isOpen2}
        title="결제"
        onClose={() => setIsOpen2(false)}
        footer={
          <Button
            variant="secondary"
            className="flex w-full h-12.5 rounded-full"
          >
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
    </>
  );
}
