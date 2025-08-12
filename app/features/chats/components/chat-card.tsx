import { Ellipsis, MapPin } from "lucide-react";
import { DateTime } from "luxon";
import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import UserAvatar from "~/common/components/user-avatar";
import { cn } from "~/lib/utils";

interface ChatCardProps {
  id: number;
  title: string;
  location: string;
  postedAt: string;
  status: string;
  avatarUrl: string;
  username: string;
  productImage: string;
  notSeenCount: number;
  lastMessage: string;
}

export default function ChatCard({
  id,
  title,
  location,
  postedAt,
  status,
  avatarUrl,
  username,
  productImage,
  notSeenCount,
  lastMessage,
}: ChatCardProps) {
  return (
    <Link to={`/chats/${id}`} className="w-full">
      <div className="flex pt-2 px-4 items-start gap-4 self-stretch">
        <div className="flex pb-6 items-center gap-3 self-stretch border-b-1">
          {/* 이미지 영역 */}
          <div className="flex size-20 justify-center items-center aspect-square rounded-xl">
            <img src={productImage} />
          </div>

          {/* 중앙 컨텐츠 영역 */}
          <div className="flex flex-col justify-between items-start grow min-w-0 self-stretch">
            <div className="flex flex-col min-w-0 items-start gap-4 grow self-stretch">
              <div className="flex flex-col min-w-0 items-start gap-1 self-stretch">
                <span className="font-pretendard text-[15px] line-clamp-1 not-italic font-medium leading-5.25">
                  {/* {title} */}
                  {lastMessage}
                </span>
                <div className="flex items-center gap-1 self-stretch">
                  <div className="flex items-center gap-0.5">
                    <MapPin className="size-3.5 aspect-square" />
                    <span className="font-pretendard text-xs not-italic font-normal leading-3 text-muted-foreground">
                      {location}
                    </span>
                  </div>
                  <Ellipsis className="size-0.5 aspect-square" />
                  <span className="font-pretendard text-xs font-normal not-italic leading-3 text-muted-foreground">
                    {DateTime.fromISO(postedAt).toRelative()}
                  </span>
                </div>
              </div>

              <Badge
                className={cn([
                  "flex h-6 px-2 justify-center items-center gap-2.5",
                  "font-pretendard text-sm not-italic font-semibold leading-3.5",
                ])}
              >
                {status}
              </Badge>
            </div>
          </div>

          <div className="flex w-18 flex-col items-center gap-2 flex-shrink-0">
            <UserAvatar
              name={username}
              avatar={avatarUrl}
              mode="view"
              className="size-10 aspect-square"
            />
            <span className="font-pretendard truncate text-black text-sm not-italic font-medium leading-3.5 tracking-[-0.4px]">
              {username}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
