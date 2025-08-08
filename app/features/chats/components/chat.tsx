import Message from "./message";
import UserAvatar from "~/common/components/user-avatar";
import type { MessageProps } from "./chatRoom";

interface ChatProps {
  message: string;
  reverse: boolean;
  avatar: string;
  username: string;
  postedAt: string;
}

export default function Chat({
  messageId,
  message,
  reverse,
  username,
  avatar,
  postedAt,
  isFirst,
}: MessageProps) {
  return reverse ? (
    <>
      {isFirst ? (
        <div className="flex justify-center items-center gap-2">
          <UserAvatar
            name={username}
            avatar={avatar}
            mode="view"
            className="size-8.5"
          />
          <span>{username}</span>
        </div>
      ) : null}
      <Message message={message} reverse postedAt={postedAt} />
    </>
  ) : (
    <Message message={message} postedAt={postedAt} />
  );
}
