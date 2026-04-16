import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  Area,
} from "recharts";
import type { GrowthRecordByType, GrowthPercentilePoint } from "../queries";
import { cn } from "~/lib/utils";
import {
  heightForAge,
  weightForAge,
  headCircumferenceForAge,
  type Gender,
  type AgeBasedGrowthData,
} from "~/lib/growth-data";

type MeasurementType = "height" | "weight" | "footSize" | "headCircumference";

interface GrowthChartProps {
  type: MeasurementType;
  childNickname: string;
  records: GrowthRecordByType[];
  gender?: Gender;
  birthDate?: string;
  percentileHistory?: GrowthPercentilePoint[];
  isLast?: boolean;
}

const MEASUREMENT_CONFIG: Record<
  MeasurementType,
  {
    label: string;
    unit: string;
    title: string;
    data: AgeBasedGrowthData[] | null;
  }
> = {
  height: {
    label: "신장",
    unit: "cm",
    title: "신장 성장 그래프",
    data: heightForAge,
  },
  weight: {
    label: "체중",
    unit: "kg",
    title: "체중 성장 그래프",
    data: weightForAge,
  },
  footSize: {
    label: "발 사이즈",
    unit: "mm",
    title: "발 사이즈 성장 그래프",
    data: null,
  },
  headCircumference: {
    label: "머리둘레",
    unit: "cm",
    title: "머리둘레 성장 그래프",
    data: headCircumferenceForAge,
  },
};

function formatAgeLabel(ageMonths: number): string {
  if (ageMonths < 24) return `${ageMonths}개월`;
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  return months === 0 ? `${years}세` : `${years}세${months}개월`;
}

function calcXAxisInterval(count: number): number {
  if (count <= 6) return 0;
  if (count <= 12) return 1;
  if (count <= 24) return 2;
  return 5;
}

export default function GrowthChart({
  type,
  childNickname,
  records,
  percentileHistory,
  isLast = false,
}: GrowthChartProps) {
  const config = MEASUREMENT_CONFIG[type];

  // 최신 측정값
  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  // 백분위 차트 데이터 (DB 기반)
  const percentileChartData = useMemo(() => {
    if (!percentileHistory || percentileHistory.length === 0) return null;
    return percentileHistory.map((p) => ({
      ageMonths: p.ageMonths,
      ageLabel: formatAgeLabel(p.ageMonths),
      percentile: p.percentile,
      value: p.value,
    }));
  }, [percentileHistory]);

  // 최신 백분위 & 등수
  const latestPercentile =
    percentileHistory && percentileHistory.length > 0
      ? percentileHistory[percentileHistory.length - 1].percentile
      : null;
  const rank =
    latestPercentile !== null
      ? Math.max(1, Math.min(100, Math.round(100 - latestPercentile + 1)))
      : null;

  // 데이터가 없는 경우
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 self-stretch">
        <div className="flex items-center gap-2.5 self-stretch">
          <span className="text-base leading-[100%] tracking-[-0.2px] text-muted-foreground">
            {config.label}
          </span>
        </div>
        <div className="flex w-full py-8 flex-col items-center gap-2.5 rounded-2xl bg-white border border-muted-foreground/30">
          <p className="text-sm text-muted-foreground">
            아직 기록된 데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const xAxisInterval = calcXAxisInterval(
    percentileChartData ? percentileChartData.length : records.length
  );

  return (
    <div className="flex flex-col items-center gap-4 self-stretch">
      {/* 섹션 라벨 */}
      <div className="flex items-center gap-2.5 self-stretch">
        <span className="text-base leading-[100%] tracking-[-0.2px] text-muted-foreground">
          {config.label}
        </span>
      </div>

      {/* 그래프 카드 */}
      <div className={cn("flex w-full flex-col items-start gap-2.5", isLast ? "pb-2" : "pb-8 border-b border-b-muted-foreground/30")}>
        <div className="flex w-full pt-6 flex-col items-start gap-6 rounded-2xl bg-white border border-muted-foreground/30">
          {/* 제목 & 순위 텍스트 */}
          <div className="flex flex-col items-start gap-6 self-stretch">
            <div className="flex px-4 items-center gap-2.5 self-stretch">
              <span className="text-base leading-[100%]">{config.title}</span>
            </div>
            <div className="flex px-4 flex-col justify-center items-start gap-2 self-stretch">
              <span className="text-sm leading-[100%] text-muted-foreground">
                {childNickname}의 {config.label === "신장" ? "키" : config.label}는
              </span>
              <span className="text-base leading-[100%]">
                {rank !== null
                  ? `친구들 100명 중 ${rank}등 이에요!`
                  : type === "footSize"
                  ? "발사이즈는 또래 비교가 제공되지 않아요"
                  : "또래 비교 정보를 계산할 수 없어요"}
              </span>
            </div>
          </div>

          {/* 그래프 */}
          <div className="flex flex-col items-start self-stretch">
            <div className="flex flex-col w-full justify-center items-center gap-4">
              <div className="w-full h-48 px-2">
                <ResponsiveContainer width="100%" height="100%">
                  {percentileChartData ? (
                    /* ── 백분위 추이 차트 (DB 기반) ── */
                    <ComposedChart
                      data={percentileChartData}
                      margin={{ left: 0, right: 10, top: 20, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient
                          id={`pct-gradient-${type}`}
                          x1="0" y1="0" x2="0" y2="1"
                        >
                          <stop offset="0%" stopColor="#2d6a9f" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#2d6a9f" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>

                      <XAxis
                        dataKey="ageMonths"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickFormatter={formatAgeLabel}
                        interval={xAxisInterval}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[25, 50, 75]}
                        tickFormatter={(v) => `${v}%`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "#9ca3af" }}
                        width={28}
                      />

                      {/* 기준선: 25 / 50 / 75 */}
                      <ReferenceLine y={75} stroke="#d1d5db" strokeDasharray="4 4" />
                      <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="4 4" />
                      <ReferenceLine y={25} stroke="#d1d5db" strokeDasharray="4 4" />

                      {/* 백분위 영역 */}
                      <Area
                        type="monotone"
                        dataKey="percentile"
                        stroke="none"
                        fill={`url(#pct-gradient-${type})`}
                        fillOpacity={1}
                        isAnimationActive={false}
                      />

                      {/* 백분위 라인 */}
                      <Line
                        type="monotone"
                        dataKey="percentile"
                        stroke="#163756"
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                        isAnimationActive={false}
                      />

                      {/* 최신 포인트 강조 */}
                      {percentileChartData.length > 0 && (() => {
                        const last = percentileChartData[percentileChartData.length - 1];
                        return (
                          <ReferenceDot
                            x={last.ageMonths}
                            y={last.percentile}
                            r={4}
                            fill="#163756"
                            stroke="white"
                            strokeWidth={2}
                          />
                        );
                      })()}
                    </ComposedChart>
                  ) : (
                    /* ── 실측값 차트 (footSize 등 비교 불가 타입) ── */
                    <ComposedChart
                      data={records.map((r) => ({
                        month: new Date(r.measuredAt).getMonth() + 1 + "월",
                        childValue: r.value,
                      }))}
                      margin={{ left: 0, right: 10, top: 20, bottom: 10 }}
                    >
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        interval={xAxisInterval}
                      />
                      <YAxis hide />
                      <Line
                        type="monotone"
                        dataKey="childValue"
                        stroke="#163756"
                        strokeWidth={2}
                        dot={{ fill: "#163756", strokeWidth: 0, r: 4 }}
                        connectNulls
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* 최신 측정값 라벨 */}
              {latestRecord && (
                <div className="flex justify-end w-full px-4 pb-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary text-white rounded text-xs">
                    <span>
                      {new Date(latestRecord.measuredAt).getMonth() + 1}월
                    </span>
                    <span>
                      {latestRecord.value}
                      {config.unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
