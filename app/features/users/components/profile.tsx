import { PencilLine } from "lucide-react";
import { Link, useFetcher } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import UserAvatar from "~/common/components/user-avatar";
import { cn } from "~/lib/utils";

export default function Profile({
  isMe = false,
  profileId,
  nickname,
  avatar,
  introduction,
  comment,
  followers,
  following,
  isFollowing,
  productsCount,
}: {
  isMe?: boolean;
  profileId: string;
  nickname: string;
  avatar: string | null;
  introduction: string | null;
  comment: string | null;
  followers: string;
  following: string;
  isFollowing: boolean;
  productsCount: number;
}) {
  const fetcher = useFetcher();

  const optimisticIsFollowing =
    fetcher.state === "idle" ? isFollowing : !isFollowing;

  return (
    <div className="flex flex-col w-full py-4 justify-center items-start gap-4">
      <div className="flex pl-4 pr-6 items-center gap-6 self-stretch">
        <UserAvatar
          name={nickname}
          avatar={avatar}
          className="size-22 aspect-square"
        />

        <div className="flex flex-col justify-center items-start gap-4 grow shrink-0 basis-0">
          <span className="font-semibold self-stretch text-base">
            {nickname}
          </span>

          <div className="flex justify-between items-center self-stretch">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-6 px-2 justify-center items-center gap-2.5 rounded-full bg-muted-foreground/10">
                <span className="text-sm font-semibold">{productsCount}</span>
              </div>
              <span className="text-sm">판매글</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-6 px-2 justify-center items-center gap-2.5 rounded-full bg-muted-foreground/10">
                <span className="text-sm font-semibold">{followers}</span>
              </div>
              <span className="text-sm">팔로워</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-6 px-2 justify-center items-center gap-2.5 rounded-full bg-muted-foreground/10">
                <span className="text-sm font-semibold">{following}</span>
              </div>
              <span className="text-sm">팔로잉</span>
            </div>
          </div>
        </div>
      </div>

      {introduction && (
        <div className="flex flex-col px-4 items-start gap-2 self-stretch">
          <Badge className="h-6 text-xs text-primary bg-primary-foreground">
            한줄소개
          </Badge>
          <span className="text-sm leading-3.5 self-stretch">
            {introduction}
          </span>
        </div>
      )}

      <div className="flex px-4 justify-between gap-2 self-stretch">
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
          <>
            <fetcher.Form
              method="post"
              action={`/users/${profileId}/follow`}
              className={cn([
                "flex",
                optimisticIsFollowing ? "w-1/2" : "w-full",
              ])}
            >
              <Button
                variant={optimisticIsFollowing ? "outline" : "default"}
                className={cn([
                  "flex h-10 p-2.5 justify-center items-center gap-2.5 grow shrink-0 basis-0 rounded-md",
                  optimisticIsFollowing && "border-primary text-primary",
                ])}
                type="submit"
              >
                {optimisticIsFollowing ? "팔로잉" : "팔로우"}
              </Button>
            </fetcher.Form>
            {optimisticIsFollowing && (
              <Button
                variant="outline"
                className="flex h-10 p-2.5 w-full justify-center items-center gap-2.5 grow shrink-0 basis-0 rounded-md border-primary text-primary"
                type="submit"
              >
                메세지
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
