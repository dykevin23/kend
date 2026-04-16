import { useEffect, useMemo, useRef, useState } from "react";
import { redirect, useLoaderData, useFetcher, useNavigate } from "react-router";
import type { Route } from "./+types/product-page";
import BottomSheet from "~/common/components/bottom-sheet";
import Content from "~/common/components/content";
import { SelectAccordion } from "~/common/components/select-accordion";
import { Tab, Tabs } from "~/common/components/tabs";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import Divider from "~/common/components/divider";
import { makeSSRClient } from "~/supa-client";
import { getProductByCode } from "../queries";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/common/components/ui/carousel";
import { addToCart } from "~/features/carts/mutations";
import { isProductLiked } from "~/features/likes/queries";
import { toggleProductLike } from "~/features/likes/mutations";
import { actionErrorResponse } from "~/lib/error-handler";
import ProductInformationSection from "../components/product-information-section";
import ProductSizeDescription from "../components/product-size-description";
import ProductRatingSection from "../components/product-rating-section";
import ProductReviewSection from "../components/product-review-section";
import ProductPurchaseModal from "../components/product-purchase-modal";
import RecommendProducts from "../components/recommend-products";
import type { OrderItem } from "~/features/orders/types";
import { getUserProfile, getDefaultAddress } from "~/features/users/queries";
import { addUserAddress } from "~/features/users/mutations";
import { useAlert } from "~/hooks/useAlert";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const { productId: productCode } = params;

  const product = await getProductByCode(client, productCode);

  // 로그인한 사용자의 좋아요 여부 및 프로필/배송지 조회
  let isLiked = false;
  let profile = null;
  let address = null;

  const {
    data: { user },
  } = await client.auth.getUser();

  if (user) {
    const [liked, userProfile, defaultAddress] = await Promise.all([
      isProductLiked(client, user.id, product.id),
      getUserProfile(client, user.id),
      getDefaultAddress(client, user.id),
    ]);
    isLiked = liked;
    profile = userProfile;
    address = defaultAddress;
  }

  return { product, isLiked, profile, address };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client, headers } = makeSSRClient(request);
  const formData = await request.formData();

  const intent = formData.get("intent");

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login", { headers });
  }

  try {
    if (intent === "addToCart") {
      const skuId = formData.get("skuId") as string;
      const quantity = Number(formData.get("quantity") ?? 1);

      await addToCart(client, user.id, skuId, quantity);

      return { success: true, message: "장바구니에 추가되었습니다." };
    }

    if (intent === "toggleLike") {
      const productId = formData.get("productId") as string;
      const isLiked = await toggleProductLike(client, user.id, productId);

      return { success: true, isLiked };
    }

    if (intent === "addAddress") {
      const label = formData.get("label") as string;
      const recipientName = formData.get("recipientName") as string;
      const recipientPhone = formData.get("recipientPhone") as string;
      const zoneCode = formData.get("zoneCode") as string;
      const address = formData.get("address") as string;
      const addressDetail = formData.get("addressDetail") as string;

      await addUserAddress(client, {
        userId: user.id,
        label,
        recipientName,
        recipientPhone,
        zoneCode,
        address,
        addressDetail: addressDetail || undefined,
        isDefault: true,
      });

      return { success: true };
    }

    return { success: false, message: "알 수 없는 요청입니다." };
  } catch (error) {
    return actionErrorResponse(error);
  }
};

type TabKey = "information" | "size" | "review" | "coordination" | "inquiry";

export default function ProductPage() {
  const { product, isLiked, address } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { confirm } = useAlert();

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    setSlideCount(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const [activeTab, setActiveTab] = useState<TabKey>("information");
  const [isOptionSheetOpen, setIsOptionSheetOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [buyOption, setBuyOption] = useState<Record<string, string>>({});
  const [cartQuantity, setCartQuantity] = useState(1);
  const [purchaseItems, setPurchaseItems] = useState<OrderItem[]>([]);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const main = document.querySelector('[data-slot="content-main"]');
    if (!main) return;
    const handleScroll = () => setShowTopButton(main.scrollTop > 300);
    main.addEventListener("scroll", handleScroll, { passive: true });
    return () => main.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    document.querySelector('[data-slot="content-main"]')?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 섹션 refs
  const informationRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  // 탭 클릭 시 해당 섹션으로 스크롤 이동
  const handleTabClick = (key: TabKey) => () => {
    setActiveTab(key);

    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      information: informationRef,
      size: sizeRef,
      review: reviewRef,
    };

    const targetRef = refMap[key];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBuyClick = () => {
    setIsOptionSheetOpen(true);
  };

  const handleOptionChange = (value: string, parent: string) => {
    setBuyOption((prev) => ({ ...prev, [parent]: value }));
  };

  // SKU에서 옵션 항목 추출
  const optionItems = useMemo(() => {
    const optionKeysSet = new Set<string>();
    product.skus.forEach((sku) => {
      if (sku.options) {
        Object.keys(sku.options).forEach((key) => optionKeysSet.add(key));
      }
    });
    const optionKeys = Array.from(optionKeysSet);

    const extractNumber = (str: string): number | null => {
      const match = str.match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    };

    const sortAscending = (a: string, b: string): number => {
      const numA = extractNumber(a);
      const numB = extractNumber(b);
      if (numA !== null && numB !== null) {
        return numA - numB;
      }
      return a.localeCompare(b, "ko");
    };

    return optionKeys.map((key) => {
      const valuesSet = new Set<string>();
      product.skus.forEach((sku) => {
        if (sku.options && sku.options[key]) {
          valuesSet.add(sku.options[key]);
        }
      });
      const values = Array.from(valuesSet).sort(sortAscending);
      const displayName = product.optionCodeToName[key] ?? key;

      return {
        triggerLabel: displayName,
        value: key,
        options: values.map((val) => ({ label: val, value: val })),
      };
    });
  }, [product.skus, product.optionCodeToName]);

  // 선택한 옵션으로 SKU 찾기
  const findMatchingSku = (selectedOptions: Record<string, string>) => {
    return product.skus.find((sku) => {
      if (!sku.options) return false;
      return Object.entries(selectedOptions).every(
        ([key, value]) => sku.options?.[key] === value
      );
    });
  };

  // 장바구니 담기
  const handleAddToCart = () => {
    const matchedSku = findMatchingSku(buyOption);
    if (matchedSku) {
      fetcher.submit(
        {
          intent: "addToCart",
          skuId: matchedSku.id,
          quantity: cartQuantity.toString(),
        },
        { method: "POST" }
      );
      setIsOptionSheetOpen(false);
      setBuyOption({});
      setCartQuantity(1);
    }
  };

  // 바로 구매
  const handlePurchase = () => {
    const matchedSku = findMatchingSku(buyOption);
    if (matchedSku) {
      // 주문 아이템 생성
      const orderItem: OrderItem = {
        skuId: matchedSku.id,
        quantity: cartQuantity,
        sku: {
          skuCode: matchedSku.skuCode,
          options: matchedSku.options,
          regularPrice: matchedSku.regularPrice,
          salePrice: matchedSku.salePrice,
        },
        product: {
          id: product.id,
          productCode: product.productCode,
          name: product.name,
          mainImage: product.images[0]?.url ?? null,
        },
        seller: product.seller,
        delivery: product.delivery,
      };
      setPurchaseItems([orderItem]);
      setIsPurchaseModalOpen(true);
    }
  };

  // 장바구니 추가 성공 시 확인 다이얼로그
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.message) {
      confirm({
        title: "장바구니 담기",
        message: "상품이 장바구니에 담겼습니다.\n장바구니로 이동하시겠습니까?",
        primaryButton: {
          label: "장바구니로 이동",
          onClick: () => navigate("/carts"),
        },
        secondaryButton: {
          label: "계속 쇼핑하기",
        },
      });
    }
  }, [fetcher.data]);

  // 모든 옵션이 선택되었는지 확인
  const isAllOptionsSelected =
    optionItems.length > 0 &&
    Object.keys(buyOption).length === optionItems.length &&
    !Object.values(buyOption).includes("");

  return (
    <>
      <Content footer={<ProductFooter product={product} isLiked={isLiked} onBuyClick={handleBuyClick} />}>
        {/* 상품 이미지 캐러셀 */}
        {product.images.length > 0 ? (
          <div className="relative">
            <Carousel className="w-full" setApi={setCarouselApi}>
              <CarouselContent className="ml-0">
                {product.images.map((image, index) => (
                  <CarouselItem key={image.id} className="pl-0">
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {slideCount > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {Array.from({ length: slideCount }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      i === currentSlide ? "bg-white" : "bg-white/40"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-square bg-gray-400" />
        )}

        {/* 상품 기본 정보 */}
        <div className="flex pt-3 px-4 flex-col justify-center items-start gap-4 self-stretch">
          <span className="text-xl font-bold leading-7.5 tracking-[-0.4px]">
            {product.name}
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

        {/* 탭 네비게이션 */}
        <div className="flex w-full flex-col items-start gap-2.5 shrink-0">
          <Tabs>
            <Tab
              title="정보"
              isActive={activeTab === "information"}
              className={{ "text-muted": activeTab !== "information" }}
              onClick={handleTabClick("information")}
            />
            <Tab
              title="사이즈"
              isActive={activeTab === "size"}
              className={{ "text-muted": activeTab !== "size" }}
              onClick={handleTabClick("size")}
            />
            <Tab
              title="리뷰(4,321)"
              isActive={activeTab === "review"}
              className={{ "text-muted": activeTab !== "review" }}
              onClick={handleTabClick("review")}
            />
            <Tab
              title="코디"
              isActive={activeTab === "coordination"}
              className={{ "text-muted": activeTab !== "coordination" }}
              onClick={handleTabClick("coordination")}
            />
            <Tab
              title="문의"
              isActive={activeTab === "inquiry"}
              className={{ "text-muted": activeTab !== "inquiry" }}
              onClick={handleTabClick("inquiry")}
            />
          </Tabs>

          {/* 정보 섹션 */}
          <ProductInformationSection
            ref={informationRef}
            productName={product.name}
            descriptionImages={product.descriptionImages}
          />

          {/* 사이즈 섹션 */}
          <div ref={sizeRef}>
            <ProductSizeDescription />
          </div>
          <Divider className="w-full" />

          {/* 상품평점 섹션 */}
          <ProductRatingSection />
          <Divider className="w-full" />

          {/* 리뷰 섹션 */}
          <ProductReviewSection ref={reviewRef} />
          <Divider className="w-full" />

          {/* 추천상품 */}
          <RecommendProducts excludeIds={[product.id]} />
        </div>
      </Content>

      {/* 옵션 선택 바텀시트 */}
      <BottomSheet open={isOptionSheetOpen} setOpen={setIsOptionSheetOpen}>
        <SelectAccordion
          items={optionItems}
          values={buyOption}
          onChange={handleOptionChange}
        />

        {isAllOptionsSelected && (
          <div className="flex w-full h-18 py-4 justify-center items-center gap-1.5 shrink-0">
            <Button
              className="flex w-full h-12 px-7.5 justify-center items-center gap-2.5 flex-gsb"
              onClick={handleAddToCart}
              disabled={fetcher.state !== "idle"}
            >
              {fetcher.state !== "idle" ? "담는 중..." : "장바구니"}
            </Button>
            <Button
              variant="secondary"
              className="flex w-full h-12 px-7.5 justify-center items-center gap-2.5 flex-gsb"
              onClick={handlePurchase}
            >
              바로 구매
            </Button>
          </div>
        )}
      </BottomSheet>

      {/* 결제 모달 */}
      <ProductPurchaseModal
        open={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setPurchaseItems([]);
        }}
        items={purchaseItems}
        address={address}
      />

      {/* 맨 위로 버튼 */}
      {showTopButton && (
        <button
          type="button"
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-24 right-4 z-40",
            "w-10 h-10 rounded-full",
            "flex items-center justify-center",
            "bg-white border border-muted/30 shadow-md",
          )}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </>
  );
}

// 하단 Footer 컴포넌트
interface ProductFooterProps {
  product: {
    id: string;
    discountRate: number;
    regularPrice: number;
    salePrice: number;
  };
  isLiked: boolean;
  onBuyClick: () => void;
}

function ProductFooter({ product, isLiked, onBuyClick }: ProductFooterProps) {
  const likeFetcher = useFetcher();

  // optimistic UI: 요청 중이면 반전된 상태 표시
  const optimisticIsLiked =
    likeFetcher.state !== "idle"
      ? !isLiked
      : (likeFetcher.data?.isLiked ?? isLiked);

  const handleLikeClick = () => {
    likeFetcher.submit(
      { intent: "toggleLike", productId: product.id },
      { method: "POST" }
    );
  };

  const hasDiscount = product.discountRate > 0 && product.regularPrice !== product.salePrice;

  return (
    <>
      <div className="flex flex-col justify-center items-start gap-1 flex-gsb">
        {hasDiscount && (
          <div
            className={cn(
              "flex h-3.5 gap-1 self-stretch",
              "text-sm leading-3.5 tracking-[-0.4px]"
            )}
          >
            <span>{product.discountRate}%</span>
            <span className="text-muted line-through">
              {product.regularPrice.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex h-5 flex-col justify-center items-start gap-1 self-stretch">
          <span className="text-xl font-bold leading-4 tracking-[-0.4px]">
            {product.salePrice.toLocaleString()}원
          </span>
        </div>
      </div>
      {/* 좋아요 버튼 */}
      <button
        type="button"
        onClick={handleLikeClick}
        disabled={likeFetcher.state !== "idle"}
        className={cn(
          "flex size-12 justify-center items-center shrink-0 rounded-full border transition-all",
          optimisticIsLiked
            ? "border-accent bg-accent/10"
            : "border-muted/30 bg-white hover:bg-muted/5"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="aspect-square shrink-0"
        >
          {optimisticIsLiked ? (
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#EBABF8"
            />
          ) : (
            <path
              d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
              fill="#1E1E1E"
            />
          )}
        </svg>
      </button>
      {/* 구매하기 버튼 */}
      <Button
        variant="secondary"
        className="flex h-12.5 px-10 justify-center items-center rounded-full text-base font-bold"
        onClick={onBuyClick}
      >
        구매하기
      </Button>
    </>
  );
}
