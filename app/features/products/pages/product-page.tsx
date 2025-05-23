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
import { useState } from "react";
import { Link } from "react-router";
import SubHeader from "~/common/components/sub-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/common/components/ui/dropdown-menu";

export default function ProductPage() {
  const [isLike, setIsLike] = useState<boolean>(false);

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

      <div className="size-[375px] shrink-0 aspect-square bg-muted-foreground/30 relative"></div>

      <div className="flex flex-col items-start w-full">
        <div className="flex px-4 items-center gap-2 self-stretch ">
          <div className="flex justify-between grow shrink-0 basis-0">
            <Link to="/profile/1">
              <div className="flex gap-2 py-3 items-center">
                <Avatar>
                  <AvatarFallback>N</AvatarFallback>
                  <AvatarImage src="https://github.com/facebook.png" />
                </Avatar>
                <span className="grow shrink-0 basis-0 text-sm font-bold">
                  username
                </span>
              </div>
            </Link>
            <div className="flex justify-center items-center">
              <Badge className="text-primary bg-primary-foreground rounded-sm font-normal">
                4개월 사용가능
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex pt-6 px-4 flex-col justify-center items-start gap-4 self-stretch">
          <span className="text-xl font-semibold leading-7">
            몽클레어 키즈 만약 문자가 길어지면 어떻게 될까 궁금하지 않으세요?
          </span>
          <div className="flex items-start gap-2 self-stretch">
            <div className="flex items-center gap-1 grow shrink-0 basis-0 self-stretch">
              <div className="flex items-center gap-0.5">
                <MapPin className="size-3.5 aspect-square" />
                <span className="text-xs">2.1km 이내</span>
              </div>
              ·<span className="text-xs">3일전</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                <Eye className="size-4" />
                <span className="text-xs">10</span>
              </div>
              <div className="flex items-center gap-0.5">
                <MessageSquare className="size-4" />
                <span className="text-xs">20</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Heart className="size-4" />
                <span className="text-xs">30</span>
              </div>
            </div>
          </div>
          <div className="flex pb-6 flex-col items-start self-stretch border-b-1">
            <span className="flex items-center gap-1 self-stretch text-sm font-medium leading-5.6">
              희망 직거래 장소
            </span>
            <span className="flex items-center gap-1 self-stretch text-sm leading-5.6">
              2호선 사당역 1번 출구 파빠앞
            </span>
          </div>
        </div>
        <span className="flex py-6 px-4 items-center gap-2.5 self-stretch text-sm leading-5.6">
          몽클레어 키즈 팝니다. 2022년에 현대백화점 몽클레어 매장에서 샀습니다.
          영주증은 없습니다. 거의 입히지 못해 새제품이라고 봐도 되요.
        </span>
      </div>

      <div className="flex w-full h-18 p-4 justify-center items-center gap-4 shrink-0 border-t-1">
        <div className="flex flex-col justify-center items-start gap-2 grow shrink-0 basis-0 self-stretch">
          <span className="text-xs font-medium">판매금액</span>
          <span className="text-xl font-semibold">200,000원</span>
        </div>
        <Button
          variant="ghost"
          className="flex px-4 justify-center items-center gap-2.5 shrink-0 text-primary"
          onClick={() => setIsLike(!isLike)}
        >
          <Heart className="size-12" fill={isLike ? "currentColor" : "none"} />
        </Button>
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
