import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserAvatar({
  name,
  avatar,
}: {
  name: string;
  avatar: string | null;
}) {
  return (
    <Avatar>
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      {avatar ? <AvatarImage src={avatar} /> : null}
    </Avatar>
  );
}
