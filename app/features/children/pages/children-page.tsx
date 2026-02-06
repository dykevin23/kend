import { useState, useMemo } from "react";
import { Link, redirect, useLoaderData } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import ChildCard from "../components/child-card";
import { ChevronRight, Plus } from "lucide-react";
import GrowthChart from "../components/growth-chart";
import GrowthInputSheet from "../components/growth-input-sheet";
import { makeSSRClient } from "~/supa-client";
import {
  getChildByCode,
  getGrowthRecordsByType,
  getLatestGrowthRecord,
} from "../queries";
import { createGrowthRecord } from "../mutations";
import type { Route } from "./+types/children-page";
import { cn } from "~/lib/utils";
import {
  calculateAgeInMonths,
  getHeightPercentile,
  type Gender,
} from "~/lib/growth-data";

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
    ] = await Promise.all([
      getGrowthRecordsByType(client, child.id, "height"),
      getGrowthRecordsByType(client, child.id, "weight"),
      getGrowthRecordsByType(client, child.id, "foot_size"),
      getGrowthRecordsByType(client, child.id, "head_circumference"),
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
      console.error("Failed to add growth record:", error);
      return { error: "성장 데이터 저장에 실패했습니다." };
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
    storageImageUrl,
  } = useLoaderData<typeof loader>();

  const [isGrowthSheetOpen, setIsGrowthSheetOpen] = useState(false);

  // 성별을 Gender 타입으로 변환 (boy=1, girl=2)
  const gender: Gender = child.gender === "boy" ? 1 : 2;

  // 실제 백분위수 계산
  const growthPercentile = useMemo(() => {
    if (!child.birthDate || !latestRecord?.height) {
      return 50; // 기본값
    }

    const birthDateObj = new Date(child.birthDate);
    const measureDate = new Date(latestRecord.measuredAt);
    const ageMonths = calculateAgeInMonths(birthDateObj, measureDate);

    const result = getHeightPercentile(gender, ageMonths, latestRecord.height);
    return result?.percentile ?? 50;
  }, [child.birthDate, latestRecord, gender]);

  return (
    <div className="pb-20">
      {/* 자녀 카드 */}
      <ChildCard child={child} profileImageUrl={storageImageUrl} />

      {/* 성장 요약 카드 */}
      <div className="flex w-full px-4 flex-col justify-center items-center gap-2.5">
        <div className="flex w-full py-4 flex-col items-start gap-4 rounded-2xl bg-white border border-muted-foreground/30">
          {/* 상단 텍스트 + 배지 */}
          <div className="flex px-4 items-center gap-6 self-stretch">
            <div className="flex flex-col justify-center items-start gap-2 flex-1">
              <span className="text-sm leading-[100%] text-muted">
                {child.nickname}의 성장속도는
              </span>
              <span className="text-base leading-[100%]">
                {growthPercentile >= 70
                  ? "또래 보다 빨라요!"
                  : growthPercentile >= 30
                  ? "또래와 비슷해요!"
                  : "조금 느린 편이에요"}
              </span>
            </div>
            <Badge variant="secondary">
              100명 중 {Math.round(100 - growthPercentile + 1)}등
            </Badge>
          </div>

          {/* 슬라이더 영역 */}
          <div className="flex flex-col items-center gap-2 self-stretch px-4">
            {/* 자녀 이름 라벨 */}
            <div
              className="flex justify-center"
              style={{ marginLeft: `${growthPercentile - 50}%` }}
            >
              <div className="px-3 py-1 bg-secondary text-white text-xs rounded-full">
                {child.nickname}
              </div>
            </div>

            {/* 슬라이더 바 */}
            <div className="relative w-full h-2 bg-gray-200 rounded-full">
              {/* 진행 바 */}
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  width: `${growthPercentile}%`,
                  background: "linear-gradient(to right, #a3c4e4, #2d6a9f, #163756)",
                }}
              />
              {/* 포인트 */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-secondary rounded-full border-2 border-white shadow"
                style={{ left: `${growthPercentile}%`, marginLeft: "-6px" }}
              />
            </div>

            {/* 라벨 */}
            <div className="flex justify-between w-full text-xs text-muted-foreground">
              <span>하위</span>
              <span>중위</span>
              <span>상위</span>
            </div>
          </div>

          {/* 측정값 pills */}
          <div className="flex p-4 flex-col items-start gap-2 self-stretch">
            <div className="flex items-center gap-2 self-stretch">
              <GrowthPill label="신장" value={latestRecord?.height} unit="cm" />
              <GrowthPill
                label="머리둘레"
                value={latestRecord?.headCircumference}
                unit="cm"
              />
            </div>
            <div className="flex items-center gap-2 self-stretch">
              <GrowthPill
                label="발사이즈"
                value={latestRecord?.footSize}
                unit="mm"
              />
              <GrowthPill label="체중" value={latestRecord?.weight} unit="kg" />
            </div>
          </div>
        </div>
      </div>

      {/* 성장 그래프 섹션 */}
      <div className="flex w-full flex-col items-start pt-8 px-4 gap-4">
        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between self-stretch">
          <span className="text-xl leading-[100%] tracking-[-0.2px]">
            성장 그래프
          </span>
          <Link
            to={`/children/${child.code}/growth`}
            className="flex items-center gap-1 text-sm"
          >
            <span>최신 정보 입력</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* 그래프들 */}
        <div className="flex flex-col items-start gap-6 self-stretch">
          <GrowthChart
            type="height"
            childNickname={child.nickname}
            records={heightRecords}
            gender={gender}
            birthDate={child.birthDate ?? undefined}
          />
          <GrowthChart
            type="weight"
            childNickname={child.nickname}
            records={weightRecords}
            gender={gender}
            birthDate={child.birthDate ?? undefined}
          />
          <GrowthChart
            type="footSize"
            childNickname={child.nickname}
            records={footSizeRecords}
          />
          <GrowthChart
            type="headCircumference"
            childNickname={child.nickname}
            records={headCircumferenceRecords}
            gender={gender}
            birthDate={child.birthDate ?? undefined}
          />
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsGrowthSheetOpen(true)}
        className={cn(
          "fixed bottom-24 right-4 z-40",
          "w-14 h-14 rounded-full",
          "flex items-center justify-center",
          "shadow-lg",
        )}
      >
        <Plus className="size-7" strokeWidth={2} />
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
    <div className="flex h-8 px-3 justify-between items-center flex-1 rounded-full bg-muted/10">
      <span className="text-sm leading-[100%] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm leading-[100%] text-muted-foreground">
        {value !== null && value !== undefined ? `${value}${unit}` : "-"}
      </span>
    </div>
  );
}
