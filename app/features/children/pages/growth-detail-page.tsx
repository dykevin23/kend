import { useState } from "react";
import { Form, redirect, useLoaderData, useNavigation } from "react-router";
import { Plus, X } from "lucide-react";
import Content from "~/common/components/content";
import DatePicker from "~/common/components/date-picker";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { makeSSRClient } from "~/supa-client";
import { getChildByCode, getGrowthRecords } from "../queries";
import { createGrowthRecord } from "../mutations";
import type { Route } from "./+types/growth-detail-page";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

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

  const child = await getChildByCode(client, user.id, childCode);

  if (!child) {
    throw new Response("자녀를 찾을 수 없습니다.", { status: 404 });
  }

  const growthRecords = await getGrowthRecords(client, child.id);

  return { child, growthRecords };
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

  if (intent === "addSingleGrowth") {
    const childId = formData.get("childId") as string;
    const measuredAt = formData.get("measuredAt") as string;
    const type = formData.get("type") as string;
    const value = formData.get("value") as string;

    if (!value) {
      return { error: "측정값을 입력해주세요." };
    }

    try {
      const recordData: {
        childId: string;
        measuredAt: string;
        height?: number;
        weight?: number;
        footSize?: number;
        headCircumference?: number;
      } = {
        childId,
        measuredAt,
      };

      // 타입에 따라 해당 필드만 설정
      if (type === "height") recordData.height = parseFloat(value);
      else if (type === "weight") recordData.weight = parseFloat(value);
      else if (type === "footSize") recordData.footSize = parseFloat(value);
      else if (type === "headCircumference") recordData.headCircumference = parseFloat(value);

      await createGrowthRecord(client, recordData);

      return { success: true };
    } catch (error) {
      console.error("Failed to add growth record:", error);
      return { error: "성장 데이터 저장에 실패했습니다." };
    }
  }

  return { error: "잘못된 요청입니다." };
};

type GrowthType = "height" | "weight" | "footSize" | "headCircumference";

const GROWTH_LABELS: Record<GrowthType, { label: string; unit: string; placeholder: string }> = {
  height: { label: "신장", unit: "cm", placeholder: "100.0" },
  weight: { label: "체중", unit: "kg", placeholder: "15.0" },
  footSize: { label: "발사이즈", unit: "mm", placeholder: "150" },
  headCircumference: { label: "머리둘레", unit: "cm", placeholder: "48.0" },
};

export default function GrowthDetailPage() {
  const { child, growthRecords } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedType, setSelectedType] = useState<GrowthType>("height");
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [measuredAt, setMeasuredAt] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  // 각 타입별 최신 값 추출
  const latestValues: Record<GrowthType, number | null> = {
    height: null,
    weight: null,
    footSize: null,
    headCircumference: null,
  };

  for (const record of growthRecords) {
    if (latestValues.height === null && record.height !== null) {
      latestValues.height = record.height;
    }
    if (latestValues.weight === null && record.weight !== null) {
      latestValues.weight = record.weight;
    }
    if (latestValues.footSize === null && record.footSize !== null) {
      latestValues.footSize = record.footSize;
    }
    if (latestValues.headCircumference === null && record.headCircumference !== null) {
      latestValues.headCircumference = record.headCircumference;
    }
  }

  // 선택된 타입의 히스토리
  const historyRecords = growthRecords
    .filter((record) => record[selectedType] !== null)
    .map((record) => ({
      id: record.id,
      measuredAt: record.measuredAt,
      value: record[selectedType] as number,
    }));

  // 탭 변경 시 입력 폼 닫기
  const handleTabChange = (type: GrowthType) => {
    setSelectedType(type);
    setIsAddingRecord(false);
    setMeasuredAt(format(new Date(), "yyyy-MM-dd"));
  };

  // 추가하기 버튼 클릭
  const handleAddClick = () => {
    setIsAddingRecord(true);
    setMeasuredAt(format(new Date(), "yyyy-MM-dd"));
  };

  // 취소 버튼 클릭
  const handleCancelClick = () => {
    setIsAddingRecord(false);
    setMeasuredAt(format(new Date(), "yyyy-MM-dd"));
  };

  const isToday = measuredAt === format(new Date(), "yyyy-MM-dd");

  return (
    <Content headerPorps={{ title: `${child.nickname}의 성장 데이터`, useRight: false }}>
      <div className="flex flex-col h-full">
        {/* 성장 데이터 타입 선택 탭 */}
        <div className="flex px-4 py-3 gap-2 border-b border-muted/20">
          {(Object.keys(GROWTH_LABELS) as GrowthType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTabChange(type)}
              className={cn(
                "flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors",
                selectedType === type
                  ? "bg-secondary text-white"
                  : "bg-muted/10 text-muted-foreground"
              )}
            >
              {GROWTH_LABELS[type].label}
            </button>
          ))}
        </div>

        {/* 현재 값 표시 */}
        <div className="p-4">
          <div className="bg-white rounded-2xl p-6 border border-muted/20">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {GROWTH_LABELS[selectedType].label}
              </p>
              <p className="text-4xl font-bold">
                {latestValues[selectedType] !== null
                  ? `${latestValues[selectedType]}${GROWTH_LABELS[selectedType].unit}`
                  : "-"}
              </p>
              {historyRecords.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  마지막 측정: {format(new Date(historyRecords[0].measuredAt), "yyyy년 M월 d일", { locale: ko })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 히스토리 목록 */}
        <div className="flex-1 px-4 pb-8 overflow-y-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">측정 기록</h3>

          {historyRecords.length === 0 && !isAddingRecord ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>아직 기록이 없습니다.</p>
              <p className="text-sm mt-1">아래 버튼을 눌러 데이터를 추가해보세요.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historyRecords.map((record, index) => {
                const prevRecord = historyRecords[index + 1];
                const diff = prevRecord ? record.value - prevRecord.value : null;

                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-muted/20"
                  >
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.measuredAt), "yyyy. M. d", { locale: ko })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {diff !== null && diff !== 0 && (
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            diff > 0
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          )}
                        >
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </span>
                      )}
                      <span className="text-lg font-medium">
                        {record.value}{GROWTH_LABELS[selectedType].unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 추가하기 입력 폼 */}
          {isAddingRecord && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-secondary">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">{GROWTH_LABELS[selectedType].label} 추가</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCancelClick}
                >
                  <X size={20} />
                </Button>
              </div>

              <Form
                method="post"
                onSubmit={() => {
                  setTimeout(() => setIsAddingRecord(false), 100);
                }}
              >
                <input type="hidden" name="intent" value="addSingleGrowth" />
                <input type="hidden" name="childId" value={child.id} />
                <input type="hidden" name="type" value={selectedType} />
                <input type="hidden" name="measuredAt" value={measuredAt} />

                {/* 측정일 */}
                <div className="mb-4">
                  <Label className="text-muted-foreground mb-2 block">측정일</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={isToday ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setMeasuredAt(format(new Date(), "yyyy-MM-dd"))}
                      className="rounded-full"
                    >
                      오늘
                    </Button>
                    <div className="flex-1">
                      <DatePicker
                        value={measuredAt}
                        onChange={setMeasuredAt}
                        placeholder="다른 날짜"
                        maxDate={new Date()}
                      />
                    </div>
                  </div>
                </div>

                {/* 측정값 */}
                <div className="mb-4">
                  <Label className="text-muted-foreground mb-2 block">
                    {GROWTH_LABELS[selectedType].label}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      name="value"
                      step="0.1"
                      placeholder={GROWTH_LABELS[selectedType].placeholder}
                      className={cn(
                        "h-12 pr-12 rounded-xl text-right",
                        "border-muted/30",
                        "focus-visible:border-secondary focus-visible:ring-0"
                      )}
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {GROWTH_LABELS[selectedType].unit}
                    </span>
                  </div>
                </div>

                {/* 저장 버튼 */}
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-full"
                >
                  {isSubmitting ? "저장 중..." : "저장하기"}
                </Button>
              </Form>
            </div>
          )}

          {/* 추가하기 버튼 */}
          {!isAddingRecord && (
            <button
              type="button"
              onClick={handleAddClick}
              className={cn(
                "w-full mt-4 py-3 rounded-xl",
                "border border-dashed border-muted-foreground/30",
                "text-muted-foreground",
                "flex items-center justify-center gap-2",
                "hover:border-secondary hover:text-secondary transition-colors"
              )}
            >
              <Plus size={18} />
              <span>{GROWTH_LABELS[selectedType].label} 추가하기</span>
            </button>
          )}
        </div>
      </div>
    </Content>
  );
}
