import SubHeader from "~/common/components/sub-header";
import Profile from "../components/profile";
import { useSearchParams } from "react-router";
import { cn } from "~/lib/utils";
import { Ellipsis } from "lucide-react";
import type { Route } from "./+types/user-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId, getProfileByUserId } from "../queries";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const profile = await getProfileByUserId(client, { userId: params.userId });
  return { profile };
};

export default function UserPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "ongoing";
  return (
    <div>
      <SubHeader title={loaderData.profile.nickname} />

      <Profile
        profileId={loaderData.profile.profile_id}
        nickname={loaderData.profile.nickname}
        avatar={loaderData.profile.avatar}
        introduction={loaderData.profile.introduction}
        comment={loaderData.profile.comment}
        followers={loaderData.profile.followers}
        following={loaderData.profile.following}
        isFollowing={loaderData.profile.is_following}
      />

      <div className="flex flex-col w-full items-start gap-6">
        <div className="flex items-center self-stretch">
          <div
            className={cn([
              "flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0 text-base font-semibold",
              filter === "ongoing"
                ? "border-b-2 border-primary"
                : "text-muted-foreground",
            ])}
            onClick={() => {
              searchParams.set("filter", "ongoing");
              setSearchParams(searchParams);
            }}
          >
            <span>판매중</span>
            <span>12</span>
          </div>

          <div
            className={cn([
              "flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0 text-base font-semibold",
              filter === "done"
                ? "border-b-2 border-primary"
                : "text-muted-foreground",
            ])}
            onClick={() => {
              searchParams.set("filter", "done");
              setSearchParams(searchParams);
            }}
          >
            <span>판매완료</span>
            <span>50</span>
          </div>
        </div>

        <div className="flex px-4 items-start gap-4 self-stretch">
          <div className="flex pb-6 items-start gap-4 grow shrink-0 basis-0 self-stretch">
            <div className="flex size-28 justify-center items-center aspect-square bg-accent-foreground/50 rounded-md"></div>

            <div className="flex flex-col justify-between items-start grow shrink-0 basis-0 self-stretch">
              <div className="flex flex-col items-start gap-4 grow shrink-0 basis-0 self-stretch">
                <div className="flex flex-col items-start gap-2 self-stretch">
                  <span className="text-[15px] font-medium leading-[21px] text-ellipsis">
                    몽클레어 키즈
                  </span>
                  <div className="flex items-center gap-1 self-stretch">
                    <span className="text-xs text-muted-foreground/50">
                      3일 전 등록
                    </span>
                  </div>
                </div>
                <div className="self-stretch">
                  <span className="text-[15px] font-bold leading-[21px]">
                    320,000원
                  </span>
                </div>
              </div>
            </div>

            <Ellipsis className="size-6 rounded-[6px] bg-muted-foreground/50 px-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
