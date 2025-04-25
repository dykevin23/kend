import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";
import Message from "./message";

interface ChatProps {
  message: string;
  reverse?: boolean;
  avatarUrl?: string;
  username?: string;
  postedAt: string;
}

export default function Chat({
  message,
  reverse,
  avatarUrl,
  username,
  postedAt,
}: ChatProps) {
  return reverse ? (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <Avatar className="size-8.5 rounded-xl">
        <AvatarFallback>N</AvatarFallback>
        <AvatarImage src={avatarUrl} />
      </Avatar>
      <Message message={message} reverse postedAt={postedAt} />
    </div>
  ) : (
    <Message message={message} postedAt={postedAt} />
  );
}
