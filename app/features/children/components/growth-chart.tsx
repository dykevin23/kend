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

// recharts는 SVG 속성으로 색을 넘겨 CSS 변수를 쓸 수 없어 app.css 토큰 값을 그대로 둔다
const CHART_COLORS = {
  line: "#1a3f66", // navy-700
  area: "#4a709c", // navy-500
  tick: "#9da2ab", // gray-400
  grid: "#e6e8ec", // gray-200
  gridMid: "#cdd0d6", // gray-300
  latest: "#ff8a1f", // orange-500
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
      <div className="flex w-full py-10 justify-center">
        <p className="text-sm text-gray-500">아직 기록된 데이터가 없습니다.</p>
      </div>
    );
  }

  const xAxisInterval = calcXAxisInterval(
    percentileChartData ? percentileChartData.length : records.length
  );

  return (
    <div className="flex w-full flex-col gap-3">
          {/* 또래 비교 문구 */}
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-gray-500">
              {childNickname}의 {config.label === "신장" ? "키" : config.label}는
            </span>
            <span className="text-sm font-bold text-gray-900">
              {rank !== null
                ? `친구들 100명 중 ${rank}등 이에요!`
                : type === "footSize"
                ? "발사이즈는 또래 비교가 제공되지 않아요"
                : "또래 비교 정보를 계산할 수 없어요"}
            </span>
          </div>

          {/* 그래프 */}
          <div className="flex flex-col items-start self-stretch">
            <div className="flex flex-col w-full justify-center items-center gap-4">
              <div className="w-full h-48">
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
                          <stop offset="0%" stopColor={CHART_COLORS.area} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={CHART_COLORS.area} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>

                      <XAxis
                        dataKey="ageMonths"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: CHART_COLORS.tick }}
                        tickFormatter={formatAgeLabel}
                        interval={xAxisInterval}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[25, 50, 75]}
                        tickFormatter={(v) => `${v}%`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: CHART_COLORS.tick }}
                        width={28}
                      />

                      {/* 기준선: 25 / 50 / 75 */}
                      <ReferenceLine y={75} stroke={CHART_COLORS.grid} strokeDasharray="4 4" />
                      <ReferenceLine y={50} stroke={CHART_COLORS.gridMid} strokeDasharray="4 4" />
                      <ReferenceLine y={25} stroke={CHART_COLORS.grid} strokeDasharray="4 4" />

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
                        stroke={CHART_COLORS.line}
                        strokeWidth={3}
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
                            r={6}
                            fill="white"
                            stroke={CHART_COLORS.latest}
                            strokeWidth={3.5}
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
                        tick={{ fontSize: 10, fill: CHART_COLORS.tick }}
                        interval={xAxisInterval}
                      />
                      <YAxis hide />
                      <Line
                        type="monotone"
                        dataKey="childValue"
                        stroke={CHART_COLORS.line}
                        strokeWidth={3}
                        dot={{ fill: CHART_COLORS.line, strokeWidth: 0, r: 4 }}
                        connectNulls
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* 최신 측정값 라벨 */}
              {latestRecord && (
                <div className="flex justify-end w-full">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-navy-50 text-primary rounded-full text-xs font-bold">
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
  );
}
