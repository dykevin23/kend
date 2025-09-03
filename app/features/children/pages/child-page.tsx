import { ChevronRight, Settings } from "lucide-react";
import { DateTime } from "luxon";
import { useOutletContext } from "react-router";

import UserAvatar from "~/common/components/user-avatar";
import type { Route } from "./+types/child-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getGrowthDataByChildId } from "../queries";
import { SettingsIcon } from "~/assets/icons/settingsIcon";
import GrowthChart from "../components/growth-chart";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const growthData = await getGrowthDataByChildId(client, {
    childId: params.childId,
  });
};

export default function ChildPage() {
  const { child } = useOutletContext<{ child: any }>();

  const percent: number = 25;

  const leftByPercent = (p: number) => {
    if (p === 0) return "0px";
    else if (p === 100) return `calc(100% - 14px)`;
    else return `calc(${p}% - 3.5px)`;
  };

  return (
    <>
      <div className="flex w-full p-4 items-center gap-2">
        <div className="flex items-center gap-2 self-stretch grow shrink-0 basis-0">
          <UserAvatar
            className="size-12 aspect-square"
            mode="view"
            name={child.nickname}
            avatar={null}
          />
          <div className="flex flex-col justify-center items-start gap-2 grow shrink-0 basis-0">
            <div className="flex justify-between items-center self-stretch">
              <span className="font-pretendard text-base not-italic font-bold leading-4 tracking-[-0.4px]">
                {child.nickname}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-pretendard text-sm not-italic font-medium leading-3.5 tracking-[-0.4px]">
                {child.name}
              </span>

              <span className="font-pretendard text-sm not-italic font-medium leading-3.5 tracking-[-0.4px]">
                {DateTime.fromISO(child.birthday).toFormat("yyyy.MM.dd")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex size-7 p-0.5 justify-center items-center shrink-0 aspect-square">
          <SettingsIcon />
        </div>
      </div>

      {/* 아이성장카드 */}
      <div className="flex w-full px-4 flex-col justify-center items-center gap-2.5">
        <div className="flex w-full py-4 flex-col items-start gap-6 rounded-2xl bg-white border-muted/90 border-1">
          <div className="flex px-4 items-center gap-6 self-stretch">
            <div className="flex flex-col justify-center items-start gap-2 grow shrink-0 basis-0">
              <span className="font-pretendard text-sm not-italic font-normal leading-3.5 text-muted-foreground">
                우리 땡이는 잠만자는
              </span>

              <span className="font-pretendard text-base not-italic font-semibold leading-4">
                또래 보다 성장 속도가 빨라요!
              </span>
            </div>

            <div className="flex h-6 px-2 justify-center items-center gap-2.5 rounded-md bg-primary/10">
              <span className="font-pretendard text-sm not-italic font-semibold leading-3.5 text-primary">
                100명 중 10등
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 self-stretch">
            <div className="relative w-full px-6 h-20 flex items-center">
              {/* 트랙 */}
              <div className="relative w-full h-3.5 bg-primary/10 rounded-full">
                {/* 하위 */}
                <div className="absolute left-[2px] top-1/2 -translate-y-1/2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B0C7E2]" />
                </div>
                <div className="absolute left-0 top-full mt-2 text-sm text-blue-500">
                  하위
                </div>

                {/* 중위 */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B0C7E2]" />
                </div>
                <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 text-sm text-blue-500">
                  중위
                </div>

                {/* 상위 */}
                <div className="absolute right-[2px] top-1/2 -translate-y-1/2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B0C7E2]" />
                </div>
                <div className="absolute right-0 top-full mt-2 text-sm text-blue-500">
                  상위
                </div>

                {/* 데이터 포인터 */}
                <div
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: leftByPercent(percent) }}
                >
                  {/* 포인터 */}
                  <div className="w-3.5 h-3.5 rounded-full bg-[#163E64]" />

                  {/* 말풍선 (포인터 위로 띄우기) */}
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 rounded-full bg-[#163E64] text-white text-sm relative whitespace-nowrap">
                      {child.nickname}
                      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#163E64]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col p-4 items-start gap-2 self-stretch">
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex h-8 px-3 justify-between items-center grow shrink-0 basis-0 rounded-full bg-accent">
                  <span className="font-pretendard text-sm not-italic font-medium leading-3.5">
                    신장
                  </span>
                  <span className="font-pretendard text-sm not-italic font-medium leading-3.5">
                    101.5cm
                  </span>
                </div>

                <div className="flex h-8 px-3 justify-between items-center grow shrink-0 basis-0 rounded-full bg-accent">
                  <span className="font-pretendard text-sm not-italic font-medium leading-3.5">
                    신장
                  </span>
                  <span className="font-pretendard text-sm not-italic font-medium leading-3.5">
                    101.5cm
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch">
                <div className="flex h-8 px-3 justify-between items-center grow shrink-0 basis-0 rounded-full bg-accent">
                  <span className="font-pretendard text-sm not-italic font-medium leading-3.5">
                    신장
                  </span>
                  <span className="font-pretendard text-sm not-italic font-medium leading-3.5">
                    101.5cm
                  </span>
                </div>

                <div className="flex h-8 px-3 justify-between items-center grow shrink-0 basis-0 rounded-full bg-accent">
                  <span className="font-pretendard text-sm not-italic font-medium leading-3.5">
                    신장
                  </span>
                  <span className="font-pretendard text-sm not-italic font-medium leading-3.5">
                    101.5cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 자녀 데이터 그래프 */}
      <div className="flex w-full flex-col items-start gap-4">
        {/* 상단헤더 */}
        <div className="flex px-4 items-center gap-2.5 self-stretch">
          <div className="grow shrink-0 basis-0">
            <span className="font-pretendard text-xl not-italic font-semibold leading-5 tracking-[-0.2px]">
              성장 그래프
            </span>
          </div>

          <div className="flex justify-center items-center gap-2.5 rounded-full">
            <span className="font-pretendard text-sm not-italic font-medium leading-3.5 tracking-[-0.2px] text-primary">
              최신 정보 입력
            </span>
            <ChevronRight className="size-4 aspect-square" />
          </div>
        </div>

        <div className="flex flex-col items-start gap-6 self-stretch">
          <div className="flex flex-col items-center gap-4 self-stretch">
            <div className="flex px-4 items-center gap-2.5 self-stretch">
              <span className="font-pretendard text-base not-italic font-semibold leading-4 tracking-[-0.2px] text-muted-foreground">
                신장
              </span>
            </div>

            <GrowthChart />
          </div>
        </div>
      </div>
    </>
  );
}
