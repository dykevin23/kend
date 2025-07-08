import { PencilLine } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";

export default function Profile({ isMe = false }: { isMe?: boolean }) {
  const [isFollow, setIsFollow] = useState<boolean>(false);
  return (
    <div className="flex flex-col w-full py-4 justify-center items-start gap-4">
      <div className="flex pl-4 pr-6 items-center gap-6 self-stretch">
        <Avatar className="size-22 aspect-square">
          <AvatarFallback>N</AvatarFallback>
          <AvatarImage src="https://github.com/facebook.png" />
        </Avatar>

        <div className="flex flex-col justify-center items-start gap-4 grow shrink-0 basis-0">
          <span className="font-semibold self-stretch text-base">
            강남아메키라노
          </span>

          <div className="flex justify-between items-center self-stretch">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-6 px-2 justify-center items-center gap-2.5 rounded-full bg-muted-foreground/10">
                <span className="text-sm font-semibold">8,865</span>
              </div>
              <span className="text-sm">판매글</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-6 px-2 justify-center items-center gap-2.5 rounded-full bg-muted-foreground/10">
                <span className="text-sm font-semibold">8,865</span>
              </div>
              <span className="text-sm">팔로워</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-6 px-2 justify-center items-center gap-2.5 rounded-full bg-muted-foreground/10">
                <span className="text-sm font-semibold">8,865</span>
              </div>
              <span className="text-sm">팔로잉</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-4 items-start gap-2 self-stretch">
        <Badge className="h-6 text-xs text-primary bg-primary-foreground">
          한줄소개
        </Badge>
        <span className="text-sm leading-3.5 self-stretch">
          씩씩이 아빠 입니다 ^^
        </span>
      </div>

      <div className="flex px-4 items-start gap-2 self-stretch">
        {isMe ? (
          <Button
            variant="outline"
            className="flex h-10 p-2.5 justify-center items-center gap-2.5 grow shrink-0 basis-0 self-stretch rounded-md"
            asChild
          >
            <Link to="/profile/modify">
              <PencilLine className="size-5 aspect-square" />
              프로필 수정하기
            </Link>
          </Button>
        ) : (
          <Button
            variant={isFollow ? "outline" : "default"}
            className={cn([
              "flex h-10 p-2.5 justify-center items-center gap-2.5 grow shrink-0 basis-0 rounded-md",
              isFollow && "border-primary text-primary",
            ])}
            onClick={() => setIsFollow(!isFollow)}
          >
            {isFollow ? "팔로잉" : "팔로우"}
          </Button>
        )}
      </div>
    </div>
  );
}
