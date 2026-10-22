import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Heart, Star, X } from "lucide-react";
import {
  Link,
  redirect,
  useLoaderData,
  useFetcher,
  useNavigate,
  useSearchParams,
  type ShouldRevalidateFunction,
} from "react-router";
import type { Route } from "./+types/product-page";
import BottomSheet from "~/common/components/bottom-sheet";
import Content from "~/common/components/content";
import FloatingHeader, {
  floatingIconButtonClass,
} from "~/common/components/floating-header";
import { OptionChips } from "~/common/components/option-chips";
import { Tab, Tabs } from "~/common/components/tabs";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import Divider from "~/common/components/divider";
import { makeSSRClient } from "~/supa-client";
import { getProductByCode, type ProductDetail } from "../queries";
import { getProductRatingSummary, getProductReviews } from "~/features/reviews/queries";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/common/components/ui/carousel";
import { addToCart } from "~/features/carts/mutations";
import { isProductLiked } from "~/features/likes/queries";
import { toggleProductLike } from "~/features/likes/mutations";
import { recordProductView } from "../mutations";
import { actionErrorResponse } from "~/lib/error-handler";
import ProductInformationSection from "../components/product-information-section";
import ProductPolicySection from "../components/product-policy-section";
import ProductSizeDescription from "../components/product-size-description";
import ProductRatingSection from "../components/product-rating-section";
import ProductReviewSection from "../components/product-review-section";
import ProductPurchaseModal from "../components/product-purchase-modal";
import RecommendProducts from "../components/recommend-products";
import { getPurchaseBlockReason, isSkuOrderable, type PurchaseBlockReason } from "../status";
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

  const [ratingSummary, reviews] = await Promise.all([
    getProductRatingSummary(client, product.id),
    getProductReviews(client, product.id),
  ]);

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

  return { product, isLiked, profile, address, ratingSummary, reviews };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client, headers } = makeSSRClient(request);
  const formData = await request.formData();

  const intent = formData.get("intent");

  const {
    data: { user },
  } = await client.auth.getUser();

  // 최근 본 상품 기록 — 컴포넌트가 실제로 마운트된 뒤에만 호출되므로(아래 useEffect),
  // prefetch="intent"(호버/터치만으로 loader가 도는 것)에 낚이지 않는다. 로그인 안 했으면
  // 조용히 무시(로그인 페이지로 리다이렉트하면 안 됨 — 배경에서 조용히 도는 호출이라)
  if (intent === "recordView") {
    if (user) {
      const productId = formData.get("productId") as string;
      await recordProductView(client, user.id, productId);
    }
    return { success: true };
  }

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

// 바로구매 → 주문 생성(intent=create) 직후엔 Toss 결제창으로 페이지를 떠나므로
// 이 무거운 loader를 revalidate하지 않는다 — revalidation fetch가 페이지 이동으로
// abort되면서 ErrorBoundary가 잠깐 뜨는 문제 방지.
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formData,
  defaultShouldRevalidate,
}) => {
  if (formData?.get("intent") === "create") return false;
  return defaultShouldRevalidate;
};

type TabKey = "information" | "size" | "review" | "coordination" | "inquiry";

export default function ProductPage() {
  const { product, isLiked, profile, address, ratingSummary, reviews } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const viewFetcher = useFetcher();
  const navigate = useNavigate();
  const { confirm, alert } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  // 실제로 이 페이지가 렌더될 때만 기록 — loader에 넣으면 prefetch="intent"(카드 호버/터치)
  // 만으로도 "본 것"이 되어버려서 액션으로 분리했다
  useEffect(() => {
    if (!profile) return;
    viewFetcher.submit(
      { intent: "recordView", productId: product.id },
      { method: "post" }
    );
  }, [product.id, !!profile]);

  // 결제 취소/실패로 이 화면(바로구매 시작 지점)에 되돌아온 경우
  useEffect(() => {
    const error = searchParams.get("payment_error");
    const cancelled = searchParams.get("payment_cancelled");
    if (!error && !cancelled) return;

    if (error) {
      alert({
        title: "결제 실패",
        message: error,
        primaryButton: { label: "확인" },
      });
    }
    // 취소는 별도 안내 없이 조용히 (사용자가 스스로 취소)

    const next = new URLSearchParams(searchParams);
    next.delete("payment_error");
    next.delete("payment_cancelled");
    setSearchParams(next, { replace: true });
  }, []);

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

  // 지금 이 상품을 구매할 수 없다면 그 이유 (§3 참조 화면 규칙 — 상세 진입은
  // 항상 허용하되 구매 액션만 막는다)
  const purchaseBlock = getPurchaseBlockReason(product.status, product.skus);

  const handleBuyClick = () => {
    if (purchaseBlock) return;
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
        // 이 옵션값 + 이미 선택된 다른 옵션값 조합에 해당하는 SKU 중 구매 가능한
        // 게 하나도 없으면 숨기지 말고 선택 불가(회색) 처리 (§3)
        options: values.map((val) => {
          const matchingSkus = product.skus.filter((sku) => {
            if (!sku.options || sku.options[key] !== val) return false;
            const matchesOtherSelections = Object.entries(buyOption).every(
              ([otherKey, otherVal]) =>
                otherKey === key || !otherVal || sku.options?.[otherKey] === otherVal
            );
            return matchesOtherSelections;
          });
          const hasOrderableMatch = matchingSkus.some((sku) =>
            isSkuOrderable(product.status, sku)
          );
          // 불가 사유 라벨 — 매칭되는 SKU가 전부 STOP이면 "판매중지", 그 외
          // (품절/재고0 포함)엔 "품절" (§3 "일부 옵션만 불가" 표)
          const unavailableSuffix =
            !hasOrderableMatch && matchingSkus.length > 0
              ? matchingSkus.every((sku) => sku.status === "STOP")
                ? " (판매중지)"
                : " (품절)"
              : "";
          return {
            label: `${val}${unavailableSuffix}`,
            value: val,
            disabled: !hasOrderableMatch,
          };
        }),
      };
    });
  }, [product.skus, product.optionCodeToName, product.status, buyOption]);

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
    if (matchedSku && isSkuOrderable(product.status, matchedSku)) {
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
    if (matchedSku && isSkuOrderable(product.status, matchedSku)) {
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

  // 옵션을 다 고르면 해당 SKU 가격, 아니면 대표 판매가
  const selectedPrice =
    (isAllOptionsSelected ? findMatchingSku(buyOption)?.salePrice : 0) ||
    product.salePrice;

  return (
    <>
      <Content
        hideHeader
        footer={
          <ProductFooter
            salePrice={product.salePrice}
            purchaseBlock={purchaseBlock}
            onBuyClick={handleBuyClick}
          />
        }
      >
        <FloatingHeader
          heroRatio={1}
          right={(solid) => (
            <ProductLikeButton productId={product.id} isLiked={isLiked} solid={solid} />
          )}
        />

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
              <>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-[5px]">
                  {Array.from({ length: slideCount }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        i === currentSlide ? "w-4 bg-white" : "w-1 bg-white/50"
                      )}
                    />
                  ))}
                </div>
                <span className="absolute right-3.5 bottom-3.5 px-[9px] py-[3px] rounded-full bg-navy-900/50 text-[11px] font-bold text-white">
                  {currentSlide + 1} / {slideCount}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="w-full aspect-square bg-gray-100" />
        )}

        {/* 상품 기본 정보 */}
        <div className="flex flex-col px-5 pt-[18px] pb-[18px] bg-white">
          {product.seller && (
            <Link
              to={`/stores/${product.seller.sellerCode}`}
              prefetch="intent"
              className="flex items-center gap-1 mb-3 w-fit text-[12.5px] font-bold text-gray-700"
            >
              {product.seller.name}
              <ChevronRight className="size-3.5 text-gray-400" strokeWidth={2.2} />
            </Link>
          )}

          <span className="text-[19px] font-extrabold leading-[1.4] text-gray-900">
            {product.name}
          </span>

          {ratingSummary.count > 0 && (
            <div className="flex items-center gap-[5px] mt-2">
              <Star className="size-3.5 fill-star text-star" strokeWidth={0} />
              <span className="text-[13px] font-bold text-gray-900">
                {ratingSummary.average}
              </span>
              <span className="text-[12.5px] text-gray-500">
                리뷰 {ratingSummary.count.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-2 mt-3.5">
            {product.discountRate > 0 && (
              <span className="text-[19px] font-extrabold text-orange-600">
                {product.discountRate}%
              </span>
            )}
            <span className="text-[23px] font-extrabold text-gray-900">
              {product.salePrice.toLocaleString()}원
            </span>
            {product.discountRate > 0 &&
              product.regularPrice !== product.salePrice && (
                <span className="text-sm text-gray-400 line-through">
                  {product.regularPrice.toLocaleString()}원
                </span>
              )}
          </div>

          <DeliveryChip delivery={product.delivery} />
        </div>

        <div className="h-2 bg-gray-50" />

        {/* 탭 네비게이션 */}
        <div className="flex w-full flex-col items-start gap-2.5 shrink-0">
          <Tabs>
            <Tab
              title="정보"
              isActive={activeTab === "information"}
              onClick={handleTabClick("information")}
            />
            <Tab
              title="사이즈"
              isActive={activeTab === "size"}
              onClick={handleTabClick("size")}
            />
            <Tab
              title={`리뷰 ${reviews.length.toLocaleString()}`}
              isActive={activeTab === "review"}
              onClick={handleTabClick("review")}
            />
            <Tab
              title="코디"
              isActive={activeTab === "coordination"}
              onClick={handleTabClick("coordination")}
            />
            <Tab
              title="문의"
              isActive={activeTab === "inquiry"}
              onClick={handleTabClick("inquiry")}
            />
          </Tabs>

          {/* 정보 섹션 */}
          <ProductInformationSection
            ref={informationRef}
            productName={product.name}
            descriptionImages={product.descriptionImages}
          />

          {/* 배송/교환/반품 안내 */}
          <div className="w-full px-4">
            <ProductPolicySection />
          </div>
          <Divider className="w-full" />

          {/* 사이즈 섹션 */}
          <div ref={sizeRef}>
            <ProductSizeDescription />
          </div>
          <Divider className="w-full" />

          {/* 상품평점 섹션 (리뷰 없으면 렌더 안 함) */}
          {ratingSummary.count > 0 && (
            <>
              <ProductRatingSection
                averageRating={ratingSummary.average}
                totalReviews={ratingSummary.count}
              />
              <Divider className="w-full" />
            </>
          )}

          {/* 리뷰 섹션 */}
          <ProductReviewSection ref={reviewRef} reviews={reviews} />
          <Divider className="w-full" />

          {/* 추천상품 */}
          <RecommendProducts excludeIds={[product.id]} />
        </div>
      </Content>

      {/* 옵션 선택 바텀시트 */}
      <BottomSheet open={isOptionSheetOpen} setOpen={setIsOptionSheetOpen}>
        <div className="flex w-full items-center gap-3">
          {product.images[0] ? (
            <img
              src={product.images[0].url}
              alt=""
              className="size-[52px] shrink-0 rounded-xl object-cover bg-gray-100"
            />
          ) : (
            <div className="size-[52px] shrink-0 rounded-xl bg-gray-100" />
          )}
          <div className="flex flex-1 min-w-0 flex-col gap-[3px]">
            <span className="text-[13.5px] font-semibold text-gray-900 truncate">
              {product.name}
            </span>
            <span className="text-[15px] font-extrabold text-gray-900">
              {selectedPrice.toLocaleString()}원
            </span>
          </div>
          <button
            type="button"
            className="p-1 text-gray-400"
            onClick={() => setIsOptionSheetOpen(false)}
            aria-label="닫기"
          >
            <X className="size-[18px]" strokeWidth={2} />
          </button>
        </div>

        <div className="h-px w-full bg-gray-100" />

        <div className="w-full max-h-[45vh] overflow-y-auto">
          <OptionChips
            items={optionItems}
            values={buyOption}
            onChange={handleOptionChange}
          />
        </div>

        <div className="h-px w-full bg-gray-100" />

        <div className="flex w-full items-center justify-between">
          <span className="text-[13.5px] text-gray-700">상품금액</span>
          <span className="text-[17px] font-extrabold text-primary">
            {selectedPrice.toLocaleString()}원
          </span>
        </div>

        <div className="flex w-full gap-2.5">
          <Button
            variant="outline"
            className="flex-1 h-[50px] text-[14.5px]"
            onClick={handleAddToCart}
            disabled={!isAllOptionsSelected || fetcher.state !== "idle"}
          >
            {fetcher.state !== "idle" ? "담는 중..." : "장바구니 담기"}
          </Button>
          <Button
            className="flex-1 h-[50px] text-[14.5px]"
            onClick={handlePurchase}
            disabled={!isAllOptionsSelected}
          >
            구매하기
          </Button>
        </div>
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
            "fixed right-4 z-40",
            "w-10 h-10 rounded-full",
            "flex items-center justify-center",
            "bg-white text-gray-700 shadow-card-md",
          )}
          style={{ bottom: "calc(5rem + var(--safe-area-inset-bottom, 0px))" }}
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
  salePrice: number;
  purchaseBlock: PurchaseBlockReason | null;
  onBuyClick: () => void;
}

function ProductFooter({ salePrice, purchaseBlock, onBuyClick }: ProductFooterProps) {
  // 구매불가 상태면 안내 문구로 대체하고 클릭 차단
  return (
    <Button
      size="lg"
      disabled={!!purchaseBlock}
      className="w-full"
      onClick={onBuyClick}
    >
      {purchaseBlock
        ? purchaseBlock.label
        : `구매하기 · ${salePrice.toLocaleString()}원`}
    </Button>
  );
}

// 히어로 이미지 위 찜 버튼
function ProductLikeButton({
  productId,
  isLiked,
  solid,
}: {
  productId: string;
  isLiked: boolean;
  solid: boolean;
}) {
  const likeFetcher = useFetcher();

  // optimistic UI: 요청 중이면 반전된 상태 표시
  const optimisticIsLiked =
    likeFetcher.state !== "idle"
      ? !isLiked
      : (likeFetcher.data?.isLiked ?? isLiked);

  const handleLikeClick = () => {
    likeFetcher.submit(
      { intent: "toggleLike", productId },
      { method: "POST" }
    );
  };

  return (
    <button
      type="button"
      onClick={handleLikeClick}
      disabled={likeFetcher.state !== "idle"}
      className={cn(
        floatingIconButtonClass,
        solid && "bg-transparent text-gray-900 backdrop-blur-none"
      )}
      aria-label={optimisticIsLiked ? "찜 해제" : "찜하기"}
      aria-pressed={optimisticIsLiked}
    >
      <Heart
        className={cn(
          "size-[19px]",
          optimisticIsLiked && "fill-accent text-accent"
        )}
        strokeWidth={optimisticIsLiked ? 0 : 1.8}
      />
    </button>
  );
}

// 배송 정책 칩 — 판매자 정책이 무료/조건부 무료일 때만 노출
// (유료배송은 플랫폼 프로모션으로 결제 시 무료가 될 수 있어 상세에선 표시하지 않음)
function DeliveryChip({ delivery }: { delivery: ProductDetail["delivery"] }) {
  if (!delivery) return null;

  let label: string | null = null;
  if (delivery.shippingFeeType === "FREE") {
    label = "무료배송";
  } else if (
    delivery.shippingFeeType === "CONDITIONAL" &&
    delivery.freeShippingCondition !== null
  ) {
    label = `${delivery.freeShippingCondition.toLocaleString()}원 이상 무료배송`;
  }
  if (!label) return null;

  return (
    <div className="flex gap-1.5 mt-3">
      <span className="px-2.5 py-[5px] rounded-full bg-navy-50 text-[11.5px] font-bold text-primary">
        {label}
      </span>
    </div>
  );
}
