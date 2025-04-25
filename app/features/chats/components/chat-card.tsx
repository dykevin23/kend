import { Ellipsis, MapPin } from "lucide-react";
import { Link } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";

interface ChatCardProps {
  id: string;
  title: string;
  location: string;
  postedAt: string;
  status: string;
  avatarUrl: string;
  username: string;
}

export default function ChatCard({
  id,
  title,
  location,
  postedAt,
  status,
  avatarUrl,
  username,
}: ChatCardProps) {
  return (
    <Link to={`/chats/${id}`}>
      <div className="flex pt-2 px-4 items-start gap-4 self-stretch">
        <div className="flex pb-6 gap-3 grow shrink-0 basis-0 self-stretch border-b-1">
          <div className="flex size-20 justify-center items-center aspect-square bg-muted-foreground/50 rounded-xl"></div>
          <div className="flex flex-col justify-between items-start grow shrink-0 basis-0 self-stretch">
            <div className="flex flex-col items-start gap-1 self-stretch">
              <span className="overflow-ellipsis text-[15px] font-medium leading-5.25 overflow-hidden">
                {title}
              </span>
              <div className="flex items-center gap-1 self-stretch">
                <div className="flex items-center gap-0.5">
                  <MapPin className="size-3.5 aspect-square" />
                  <span className="text-xs">{location}</span>
                </div>
                <Ellipsis className="size-0.5 aspect-square" />
                <span className="text-xs">{postedAt}</span>
              </div>
            </div>
            <div className="flex h-6 px-2 justify-center items-center gap-2.5">
              <Badge className="text-sm font-semibold bg-purple-200 text-purple-600">
                {status}
              </Badge>
            </div>
          </div>
          <div className="flex w-18 flex-col items-center gap-2">
            <Avatar className="size-10 aspect-square">
              <AvatarFallback>N</AvatarFallback>
              <AvatarImage src={avatarUrl} />
            </Avatar>
            <span className="text-ellipsis text-sm font-medium -tracking-[0.4px]">
              {username}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
