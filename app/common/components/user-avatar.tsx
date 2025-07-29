import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserAvatar({
  name,
  avatar,
  className,
}: {
  name: string;
  avatar: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn(className)}>
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      {avatar ? <AvatarImage src={avatar} /> : null}
    </Avatar>
  );
}
