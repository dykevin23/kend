import { useState, useMemo } from "react";
import { Link, redirect, useLoaderData } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import ChildCard from "../components/child-card";
import { ChevronRight, Plus } from "lucide-react";
import GrowthChart from "../components/growth-chart";
import GrowthInputSheet from "../components/growth-input-sheet";
import { makeSSRClient } from "~/supa-client";
import { actionErrorResponse } from "~/lib/error-handler";
import {
  getChildByCode,
  getGrowthRecordsByType,
  getGrowthPercentileHistory,
  getLatestGrowthRecord,
} from "../queries";
import { createGrowthRecord } from "../mutations";
import type { Route } from "./+types/children-page";
import { cn } from "~/lib/utils";
import { type Gender } from "~/lib/growth-data";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { childId } = params;
  const childCode = parseInt(childId, 10);

  if (isNaN(childCode)) {
    throw new Response("잘못된 요청입니다.", { status: 400 });
  }

  try {
    const child = await getChildByCode(client, user.id, childCode);

    if (!child) {
      throw new Response("자녀를 찾을 수 없습니다.", { status: 404 });
    }

    const latestRecord = await getLatestGrowthRecord(client, child.id);

    // 측정 타입별 데이터 (그래프용)
    const [
      heightRecords,
      weightRecords,
      footSizeRecords,
      headCircumferenceRecords,
      heightPercentileHistory,
      weightPercentileHistory,
      headCircumferencePercentileHistory,
    ] = await Promise.all([
      getGrowthRecordsByType(client, child.id, "height"),
      getGrowthRecordsByType(client, child.id, "weight"),
      getGrowthRecordsByType(client, child.id, "foot_size"),
      getGrowthRecordsByType(client, child.id, "head_circumference"),
      getGrowthPercentileHistory(client, child.id, "height"),
      getGrowthPercentileHistory(client, child.id, "weight"),
      getGrowthPercentileHistory(client, child.id, "head_circumference"),
    ]);

    // 프로필 이미지 URL: profiles/{userId}/{childId}
    const storageImageUrl = child.profileImageUrl
      ? child.profileImageUrl
      : `${process.env.SUPABASE_URL}/storage/v1/object/public/profiles/${user.id}/${child.id}`;

    return {
      child,
      latestRecord,
      heightRecords,
      weightRecords,
      footSizeRecords,
      headCircumferenceRecords,
      heightPercentileHistory,
      weightPercentileHistory,
      headCircumferencePercentileHistory,
      storageImageUrl,
    };
  } catch (error) {
    console.error("Failed to load child data:", error);
    throw error;
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const intent = formData.get("intent") as string;

  if (intent === "addGrowth") {
    const childId = formData.get("childId") as string;
    const measuredAt = formData.get("measuredAt") as string;
    const height = formData.get("height") as string;
    const weight = formData.get("weight") as string;
    const footSize = formData.get("footSize") as string;
    const headCircumference = formData.get("headCircumference") as string;

    // 최소 하나의 값이 있는지 확인
    if (!height && !weight && !footSize && !headCircumference) {
      return { error: "최소 하나의 측정값을 입력해주세요." };
    }

    try {
      await createGrowthRecord(client, {
        childId,
        measuredAt,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        footSize: footSize ? parseFloat(footSize) : undefined,
        headCircumference: headCircumference
          ? parseFloat(headCircumference)
          : undefined,
      });

      return { success: true };
    } catch (error) {
      return actionErrorResponse(error);
    }
  }

  return { error: "잘못된 요청입니다." };
};

export default function ChildrenPage() {
  const {
    child,
    latestRecord,
    heightRecords,
    weightRecords,
    footSizeRecords,
    headCircumferenceRecords,
    heightPercentileHistory,
    weightPercentileHistory,
    headCircumferencePercentileHistory,
    storageImageUrl,
  } = useLoaderData<typeof loader>();

  const [isGrowthSheetOpen, setIsGrowthSheetOpen] = useState(false);

  // 성별을 Gender 타입으로 변환 (boy=1, girl=2)
  const gender: Gender = child.gender === "boy" ? 1 : 2;

  // DB 기반 최신 백분위 (신장 기준)
  const growthPercentile = useMemo(() => {
    if (heightPercentileHistory.length === 0) return 50;
    return heightPercentileHistory[heightPercentileHistory.length - 1].percentile;
  }, [heightPercentileHistory]);

  const [chartType, setChartType] = useState<ChartType>("height");
  const percentileLabel = Math.max(1, Math.min(100, Math.round(100 - growthPercentile + 1)));

  return (
    <div className="pb-16">
      {/* 자녀 카드 */}
      <ChildCard child={child} profileImageUrl={storageImageUrl} />

      <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
        {/* 성장 요약 카드 */}
        <div className="flex flex-col gap-4 p-5 bg-white rounded-card shadow-card-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-gray-500">
                {child.nickname}의 성장속도는
              </span>
              <span className="text-[15px] font-extrabold text-gray-900">
                {growthPercentile >= 70
                  ? "또래보다 빨라요"
                  : growthPercentile >= 30
                  ? "또래와 비슷해요"
                  : "조금 느린 편이에요"}
              </span>
            </div>
            <Badge variant="discount" className="px-3 py-1.5 text-[12.5px]">
              상위 {percentileLabel}%
            </Badge>
          </div>

          {/* 백분위 바 */}
          <div className="flex flex-col gap-1.5">
            <div className="relative h-2.5 rounded-full bg-linear-to-r from-navy-100 via-navy-500 to-navy-800">
              <div
                className="absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-primary bg-white shadow-[0_2px_6px_rgba(15,33,56,0.3)]"
                style={{ left: `${Math.max(3, Math.min(97, growthPercentile))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-gray-500">
              <span>하위</span>
              <span>또래 평균</span>
              <span>상위</span>
            </div>
          </div>

          {/* 측정값 */}
          <div className="flex gap-2">
            <GrowthPill label="신장" value={latestRecord?.height} unit="cm" />
            <GrowthPill label="체중" value={latestRecord?.weight} unit="kg" />
            <GrowthPill
              label="머리둘레"
              value={latestRecord?.headCircumference}
              unit="cm"
            />
            <GrowthPill label="발사이즈" value={latestRecord?.footSize} unit="mm" />
          </div>
        </div>

        {/* 성장 그래프 카드 */}
        <div className="flex flex-col gap-3.5 p-5 bg-white rounded-card shadow-card-sm">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-extrabold text-gray-900">
              성장 그래프
            </span>
            <Link
              to={`/children/${child.code}/growth`}
              className="flex items-center gap-0.5 text-[12.5px] font-semibold text-gray-500"
            >
              최신 정보 입력
              <ChevronRight className="size-3.5" strokeWidth={2.2} />
            </Link>
          </div>

          <div className="flex border-b border-gray-100">
            {CHART_TABS.map((tab) => {
              const active = chartType === tab.type;
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setChartType(tab.type)}
                  className={cn(
                    "relative flex-1 pb-2.5 text-[13px]",
                    active ? "font-extrabold text-primary" : "font-semibold text-gray-500"
                  )}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {chartType === "height" && (
            <GrowthChart
              type="height"
              childNickname={child.nickname}
              records={heightRecords}
              gender={gender}
              birthDate={child.birthDate ?? undefined}
              percentileHistory={heightPercentileHistory}
            />
          )}
          {chartType === "weight" && (
            <GrowthChart
              type="weight"
              childNickname={child.nickname}
              records={weightRecords}
              gender={gender}
              birthDate={child.birthDate ?? undefined}
              percentileHistory={weightPercentileHistory}
            />
          )}
          {chartType === "headCircumference" && (
            <GrowthChart
              type="headCircumference"
              childNickname={child.nickname}
              records={headCircumferenceRecords}
              gender={gender}
              birthDate={child.birthDate ?? undefined}
              percentileHistory={headCircumferencePercentileHistory}
            />
          )}
          {chartType === "footSize" && (
            <GrowthChart
              type="footSize"
              childNickname={child.nickname}
              records={footSizeRecords}
            />
          )}
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <Button
        type="button"
        onClick={() => setIsGrowthSheetOpen(true)}
        className="fixed bottom-24 right-5 z-40 size-[54px] p-0 shadow-[0_10px_22px_rgba(26,63,102,0.4)]"
        aria-label="성장 기록 추가"
      >
        <Plus className="size-6" strokeWidth={2.2} />
      </Button>

      {/* 성장 데이터 입력 바텀시트 */}
      <GrowthInputSheet
        open={isGrowthSheetOpen}
        setOpen={setIsGrowthSheetOpen}
        childId={child.id}
        childNickname={child.nickname}
      />
    </div>
  );
}

type ChartType = "height" | "weight" | "headCircumference" | "footSize";

const CHART_TABS: { type: ChartType; label: string }[] = [
  { type: "height", label: "신장" },
  { type: "weight", label: "체중" },
  { type: "headCircumference", label: "머리둘레" },
  { type: "footSize", label: "발사이즈" },
];

/**
 * 측정값 표시 Pill 컴포넌트
 */
function GrowthPill({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null | undefined;
  unit: string;
}) {
  return (
    <div className="flex flex-1 min-w-0 flex-col items-center gap-0.5 px-1 py-2 rounded-full bg-navy-50 text-primary">
      <span className="text-[14.5px] font-extrabold truncate max-w-full">
        {value !== null && value !== undefined ? `${value}${unit}` : "-"}
      </span>
      <span className="text-[10.5px] text-gray-500">{label}</span>
    </div>
  );
}
