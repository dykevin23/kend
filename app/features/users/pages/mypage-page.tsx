import Header from "~/common/components/header";
import Profile from "../components/profile";
import { Button } from "~/common/components/ui/button";
import { BellDot, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/mypage-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId, getProfileByUserId } from "../queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const profile = await getProfileByUserId(client, { userId });
  return { profile };
};

export default function MypagePage({ loaderData }: Route.ComponentProps) {
  const [tabStatus, setTabStatus] = useState<"sale" | "purchase">("sale");
  return (
    <div>
      <Header title="마이페이지" />

      <Profile
        isMe
        profileId={loaderData.profile.profile_id}
        nickname={loaderData.profile.nickname}
        avatar={loaderData.profile.avatar}
        introduction={loaderData.profile.introduction}
        comment={loaderData.profile.comment}
        followers={loaderData.profile.followers}
        following={loaderData.profile.following}
        isFollowing={false}
      />

      <div className="flex flex-col w-full h-[510px] shrink-0 bg-muted/50 rounded-t-md px-4 py-8 gap-8 mt-4 mb-8">
        <div className="flex w-full justify-center items-start gap-2 shrink-0">
          <Button
            className={cn([
              "flex px-6 h-10 justify-center items-center gap-2.5 rounded-full text-sm font-medium leading-3.5 -tracking-tighter",
              tabStatus === "sale"
                ? "bg-primary"
                : "bg-muted text-muted-foreground",
            ])}
            onClick={() => setTabStatus("sale")}
          >
            <span>판매내역</span>
            <span>25</span>
          </Button>

          <Button
            className={cn([
              "flex px-6 h-10 justify-center items-center gap-2.5 rounded-full text-sm font-medium leading-3.5 -tracking-tighter",
              tabStatus === "purchase"
                ? "bg-primary"
                : "bg-muted text-muted-foreground",
            ])}
            onClick={() => setTabStatus("purchase")}
          >
            <span>구매내역</span>
            <span>25</span>
          </Button>
        </div>

        <div className="flex w-full px-8 justify-center items-center gap-10">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium leading-3.5">
              {tabStatus === "sale" ? "판매 중" : "좋아요"}
            </span>
            <div className="flex size-16 p-2.5 flex-col justify-center items-center gap-2 aspect-square bg-white rounded-[18px]">
              <span className="text-xl font-bold leading-5">1</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium leading-3.5">
              {tabStatus === "sale" ? "판매 채팅 중" : "구매 채팅 중"}
            </span>
            <div className="flex size-16 p-2.5 flex-col justify-center items-center gap-2 aspect-square bg-white rounded-[18px]">
              <span className="text-xl font-bold leading-5">1</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium leading-3.5">
              {tabStatus === "sale" ? "판매완료" : "구매완료"}
            </span>
            <div className="flex size-16 p-2.5 flex-col justify-center items-center gap-2 aspect-square bg-white rounded-[18px]">
              <span className="text-xl font-bold leading-5">1</span>
            </div>
          </div>
        </div>

        <div className="flex px-4 flex-col justify-center items-start gap-4 rounded-[15px] bg-white">
          <div className="flex flex-col items-start self-stretch">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="flex h-12 items-center gap-2 self-stretch">
                <BellDot className="size-5 aspect-square" />
                <span className="text-base leading-4 -tracking-[0.4px] grow shrink-0 basis-0">
                  알림 설정
                </span>
                <ChevronRight className="size-4 aspect-square" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
