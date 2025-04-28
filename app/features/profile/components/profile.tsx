import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";

export default function Profile() {
  return (
    <div className="flex w-full py-4 flex-col justify-center items-start gap-4">
      <div className="flex pr-6 pl-4 items-center gap-10 self-stretch">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-2.5">
            <Avatar className="size-18 aspect-square">
              <AvatarFallback>N</AvatarFallback>
              <AvatarImage src="https://github.com/facebook.png" />
            </Avatar>
          </div>

          <div className="flex flex-col items-start gap-2 self-stretch">
            <span className="text-base font-semibold leading-4">
              강남아메리카노
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center grow shrink-0 basis-0">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-6 px-2 justify-center items-center gap-2.5 bg-muted-foreground/20 rounded-full">
              <span className="text-sm font-semibold leading-3.5">8,865</span>
            </div>
            <span className="text-sm leading-3.5 text-muted-foreground">
              판매글
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-6 px-2 justify-center items-center gap-2.5 bg-muted-foreground/20 rounded-full">
              <span className="text-sm font-semibold leading-3.5">8,865</span>
            </div>
            <span className="text-sm leading-3.5 text-muted-foreground">
              팔로워
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-6 px-2 justify-center items-center gap-2.5 bg-muted-foreground/20 rounded-full">
              <span className="text-sm font-semibold leading-3.5">8,865</span>
            </div>
            <span className="text-sm leading-3.5 text-muted-foreground">
              팔로잉
            </span>
          </div>
        </div>
      </div>

      <div className="flex px-4 flex-col items-start gap-2 self-stretch">
        <Badge className="text-xs text-primary bg-primary-foreground">
          한줄소개
        </Badge>
        <span className="text-sm leading-3.5 self-stretch">
          씩씩이 아빠 입니다 ^^
        </span>
      </div>
    </div>
  );
}
