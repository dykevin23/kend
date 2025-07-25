import {
  EllipsisVertical,
  Eye,
  EyeOff,
  Flag,
  Heart,
  MapPin,
  MessageSquare,
  Share,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router";
import SubHeader from "~/common/components/sub-header";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/common/components/ui/dropdown-menu";
import type { Route } from "./+types/product-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getImagesByProductId, getProductById } from "../queries";
import UserAvatar from "~/common/components/user-avatar";
import { DateTime } from "luxon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/common/components/ui/carousel";
import { formatCurrency } from "~/lib/utils";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const product = await getProductById(client, {
    product_id: Number(params.productId),
  });
  const productImages = await getImagesByProductId(client, {
    product_id: Number(params.productId),
  });

  await client.rpc("track_event", {
    event_type: "product_view",
    event_data: {
      product_id: params.productId,
    },
  });

  return { product, productImages };
};

export default function ProductPage({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState<number>(0);

  const optimisticIsUpload =
    fetcher.state === "idle"
      ? loaderData.product.is_liked
      : !loaderData.product.is_liked;

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div>
      <SubHeader
        absolute
        rightComponent={
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="inline-flex py-5 px-4 flex-col justify-center items-start gap-5">
              <DropdownMenuLabel asChild className="flex items-center gap-2.5">
                <Flag className="size-5 aspect-square" />
                <span className="text-sm">게시물 신고하기</span>
              </DropdownMenuLabel>
              <DropdownMenuLabel className="flex items-center gap-2.5">
                <EyeOff className="size-5 aspect-square" />
                <span className="text-sm">게시물 숨기기</span>
              </DropdownMenuLabel>
              <DropdownMenuLabel className="flex items-center gap-2.5">
                <Share className="size-5 aspect-square" />
                <span className="text-sm">공유하기</span>
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* <div className="size-[375px] shrink-0 aspect-square bg-muted-foreground/30 relative"></div> */}
      {loaderData.productImages.length > 1 ? (
        <>
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {loaderData.productImages.map((image) => (
                <CarouselItem key={image.image}>
                  <img
                    src={image.image}
                    className="flex w-full aspect-square relative shrink-0"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="flex justify-center items-center gap-2">
            {loaderData.productImages.map((_, index) => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                className="size-2 aspect-square"
              >
                <circle
                  cx="4"
                  cy="4"
                  r="4"
                  fill={index === current ? "white" : "#DEDEDE"}
                />
              </svg>
            ))}
          </div>
        </>
      ) : (
        <img
          src={loaderData.productImages[0].image}
          className="flex w-full aspect-square relative shrink-0"
        />
      )}

      <div className="flex flex-col items-start w-full">
        {/* 등록자 프로필 정보 start */}
        <div className="flex px-4 items-center gap-2 self-stretch">
          <div className="flex py-3 items-center gap-2 grow shrink-0 basis-0 self-stretch border-b-1 border-b-accent">
            <UserAvatar
              name={loaderData.product.username}
              avatar={loaderData.product.avatar}
            />
            <div className="flex justify-between items-center grow shrink-0 basis-0">
              <div className="grow shrink-0 basis-0">
                <span className="font-pretendard text-sm not-italic font-bold leading-3.5 tracking-[-0.4px]">
                  {loaderData.product.username}
                </span>
              </div>
              <Badge className="text-primary bg-accent rounded-sm font-normal">
                4개월 사용가능
              </Badge>
            </div>
            {/* <Link to={`/users/${loaderData.product.user.profile_id}`}>
              <div className="flex gap-2 py-3 items-center">
                <UserAvatar
                  name={loaderData.product.user.username}
                  avatar={loaderData.product.user.avatar}
                />
                <span className="grow shrink-0 basis-0 text-sm font-bold">
                  {loaderData.product.user.username}
                </span>
              </div>
            </Link>
            <div className="flex justify-center items-center">
              <Badge className="text-primary bg-primary-foreground rounded-sm font-normal">
                4개월 사용가능
              </Badge>
            </div> */}
          </div>
        </div>
        {/* 등록자 프로필 정보 end */}

        <div className="flex pt-6 px-4 flex-col justify-center items-start gap-4 self-stretch">
          <span className="text-xl font-semibold leading-7">
            {loaderData.product.name}
          </span>
          <div className="flex items-start gap-2 self-stretch">
            <div className="flex items-center gap-1 grow shrink-0 basis-0 self-stretch">
              <div className="flex items-center gap-0.5">
                <MapPin className="size-3.5 aspect-square" />
                <span className="text-xs">2.1km 이내</span>
              </div>
              ·
              <span className="text-xs">
                {DateTime.fromISO(loaderData.product.updated_at).toRelative()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                <Eye className="size-4" />
                <span className="text-xs">{loaderData.product.views}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <MessageSquare className="size-4" />
                <span className="text-xs">{loaderData.product.chats}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Heart className="size-4" />
                <span className="text-xs">{loaderData.product.likes}</span>
              </div>
            </div>
          </div>
          <div className="flex pb-6 flex-col items-start self-stretch border-b-1">
            <span className="flex items-center gap-1 self-stretch text-sm font-medium leading-5.6">
              희망 직거래 장소
            </span>
            <span className="flex items-center gap-1 self-stretch text-sm leading-5.6">
              {loaderData.product.deal_location}
            </span>
          </div>
        </div>
        <span className="flex py-6 px-4 items-center gap-2.5 self-stretch text-sm leading-5.6">
          {loaderData.product.description}
        </span>
      </div>

      <div className="flex w-full h-18 p-4 justify-center items-center gap-4 shrink-0 border-t-1">
        <div className="flex flex-col justify-center items-start gap-2 grow shrink-0 basis-0 self-stretch">
          <span className="text-xs font-medium">판매금액</span>
          <span className="text-xl font-semibold">
            {`${formatCurrency(loaderData.product.price)}원`}
          </span>
        </div>
        <fetcher.Form
          method="post"
          action={`/products/${loaderData.product.product_id}/like`}
        >
          <Button
            variant="ghost"
            className="flex px-4 justify-center items-center gap-2.5 shrink-0 text-primary"
          >
            <Heart
              className="size-12"
              fill={optimisticIsUpload ? "currentColor" : "none"}
            />
          </Button>
        </fetcher.Form>
        <Button
          asChild
          className="flex h-12 px-4 justify-center items-center gap-2.5 rounded-full text-sm font-semibold text-secondary"
        >
          <Link to={"/chats/1"}>메세지 보내기</Link>
        </Button>
      </div>
    </div>
  );
}
