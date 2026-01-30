import { Area, AreaChart, CartesianGrid, ReferenceDot } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/common/components/ui/chart";
import type { GrowthRecordByType } from "../queries";

type MeasurementType = "height" | "weight" | "footSize" | "headCircumference";

interface GrowthChartProps {
  type: MeasurementType;
  childNickname: string;
  records: GrowthRecordByType[];
  rank?: number; // 또래 중 순위 (선택)
}

const MEASUREMENT_CONFIG: Record<
  MeasurementType,
  { label: string; unit: string; title: string; color: string }
> = {
  height: {
    label: "신장",
    unit: "cm",
    title: "신장 성장 그래프",
    color: "hsl(var(--chart-1))",
  },
  weight: {
    label: "체중",
    unit: "kg",
    title: "체중 성장 그래프",
    color: "hsl(var(--chart-2))",
  },
  footSize: {
    label: "발 사이즈",
    unit: "mm",
    title: "발 사이즈 성장 그래프",
    color: "hsl(var(--chart-3))",
  },
  headCircumference: {
    label: "머리둘레",
    unit: "cm",
    title: "머리둘레 성장 그래프",
    color: "hsl(var(--chart-4))",
  },
};

export default function GrowthChart({
  type,
  childNickname,
  records,
  rank = 5,
}: GrowthChartProps) {
  const config = MEASUREMENT_CONFIG[type];

  // 차트 데이터 변환
  const chartData = records.map((record) => {
    const date = new Date(record.measuredAt);
    return {
      month: `${date.getMonth() + 1}월`,
      value: record.value,
      fullDate: record.measuredAt,
    };
  });

  // 최신 데이터
  const latestRecord = records.length > 0 ? records[records.length - 1] : null;
  const latestDate = latestRecord
    ? new Date(latestRecord.measuredAt)
    : null;
  const latestLabel = latestDate
    ? `${latestDate.getMonth() + 1}월`
    : "";
  const latestValue = latestRecord?.value ?? 0;

  const chartConfig = {
    value: {
      label: config.label,
      color: config.color,
    },
  } satisfies ChartConfig;

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

  return (
    <div className="flex flex-col items-center gap-4 self-stretch">
      {/* 섹션 라벨 */}
      <div className="flex items-center gap-2.5 self-stretch">
        <span className="text-base leading-[100%] tracking-[-0.2px] text-muted-foreground">
          {config.label}
        </span>
      </div>

      {/* 그래프 카드 */}
      <div className="flex w-full pb-8 flex-col items-start gap-2.5 border-b border-b-muted-foreground/30">
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
                친구들 100명 중 {rank}등 이에요!
              </span>
            </div>
          </div>

          {/* 그래프 */}
          <div className="flex flex-col items-start self-stretch">
            <div className="flex flex-col w-full justify-center items-center gap-4">
              <ChartContainer config={chartConfig} className="w-full h-48 px-4">
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 30,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${value}${config.unit}`}
                      />
                    }
                  />
                  <defs>
                    <linearGradient id={`fill-${type}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={config.color}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={config.color}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="value"
                    type="monotone"
                    fill={`url(#fill-${type})`}
                    fillOpacity={0.4}
                    stroke={config.color}
                    strokeWidth={2}
                  />
                  {/* 최신 데이터 포인트 라벨 */}
                  {latestRecord && (
                    <ReferenceDot
                      x={latestLabel}
                      y={latestValue}
                      r={6}
                      fill={config.color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  )}
                </AreaChart>
              </ChartContainer>

              {/* 최신 데이터 라벨 */}
              {latestRecord && (
                <div className="flex justify-end w-full px-4 pb-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary text-white rounded text-xs">
                    <span>{latestLabel}</span>
                    <span>
                      {latestValue}
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
