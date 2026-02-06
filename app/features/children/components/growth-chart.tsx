import { useMemo } from "react";
import {
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import type { GrowthRecordByType } from "../queries";
import {
  calculateAgeInMonths,
  getHeightPercentile,
  getWeightPercentile,
  getHeadCircumferencePercentile,
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
}

const MEASUREMENT_CONFIG: Record<
  MeasurementType,
  {
    label: string;
    unit: string;
    title: string;
    data: AgeBasedGrowthData[] | null;
    getPercentile:
      | ((
          gender: Gender,
          ageMonths: number,
          value: number
        ) => { percentile: number } | null)
      | null;
  }
> = {
  height: {
    label: "신장",
    unit: "cm",
    title: "신장 성장 그래프",
    data: heightForAge,
    getPercentile: getHeightPercentile,
  },
  weight: {
    label: "체중",
    unit: "kg",
    title: "체중 성장 그래프",
    data: weightForAge,
    getPercentile: getWeightPercentile,
  },
  footSize: {
    label: "발 사이즈",
    unit: "mm",
    title: "발 사이즈 성장 그래프",
    data: null,
    getPercentile: null,
  },
  headCircumference: {
    label: "머리둘레",
    unit: "cm",
    title: "머리둘레 성장 그래프",
    data: headCircumferenceForAge,
    getPercentile: getHeadCircumferencePercentile,
  },
};

export default function GrowthChart({
  type,
  childNickname,
  records,
  gender,
  birthDate,
}: GrowthChartProps) {
  const config = MEASUREMENT_CONFIG[type];

  // 최신 데이터와 백분위수 계산
  const { latestRecord, rank, ageMonths: latestAgeMonths } = useMemo(() => {
    if (!gender || !birthDate || records.length === 0 || !config.getPercentile) {
      const latest = records.length > 0 ? records[records.length - 1] : null;
      return { latestRecord: latest, rank: null, ageMonths: null };
    }

    const latest = records[records.length - 1];
    const birthDateObj = new Date(birthDate);
    const measureDate = new Date(latest.measuredAt);
    const ageMonths = calculateAgeInMonths(birthDateObj, measureDate);

    const result = config.getPercentile(gender, ageMonths, latest.value ?? 0);
    const calculatedRank = result
      ? Math.max(1, Math.min(100, Math.round(100 - result.percentile + 1)))
      : null;

    return { latestRecord: latest, rank: calculatedRank, ageMonths };
  }, [gender, birthDate, records, config]);

  // 차트 데이터 생성: 기준 데이터 + 사용자 데이터
  const { chartData, yDomain } = useMemo(() => {
    if (!gender || !birthDate || !config.data) {
      // 기준 데이터가 없으면 사용자 데이터만 표시
      const userData = records.map((record) => {
        const date = new Date(record.measuredAt);
        return {
          month: `${date.getMonth() + 1}월`,
          childValue: record.value,
        };
      });

      const values = records.map((r) => r.value).filter((v): v is number => v !== null);
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 100;
      const padding = (max - min) * 0.2 || 10;

      return {
        chartData: userData,
        yDomain: [Math.floor(min - padding), Math.ceil(max + padding)],
      };
    }

    const birthDateObj = new Date(birthDate);

    // 사용자 데이터의 연령 범위 계산
    const userAgeMonths = records.map((record) => {
      const measureDate = new Date(record.measuredAt);
      return calculateAgeInMonths(birthDateObj, measureDate);
    });

    if (userAgeMonths.length === 0) {
      return { chartData: [], yDomain: [0, 100] as [number, number] };
    }

    // X축은 항상 0개월부터 시작
    const minAge = 0;
    const maxAge = Math.min(
      config.data.filter((d) => d.gender === gender).length > 0
        ? Math.max(...config.data.filter((d) => d.gender === gender).map((d) => d.ageMonths))
        : 228,
      Math.max(...userAgeMonths) + 6
    );

    // 연령별 차트 데이터 생성
    const data: Array<{
      ageMonths: number;
      ageLabel: string;
      p25: number | null;
      p50: number | null;
      p75: number | null;
      childValue: number | null;
    }> = [];

    // 기준 데이터 (25%, 50%, 75% 백분위)
    for (let age = minAge; age <= maxAge; age++) {
      const refData = config.data.find(
        (d) => d.gender === gender && d.ageMonths === age
      );

      let ageLabel: string;
      if (age < 24) {
        ageLabel = `${age}개월`;
      } else {
        const years = Math.floor(age / 12);
        const months = age % 12;
        ageLabel = months === 0 ? `${years}세` : `${years}세${months}개월`;
      }

      data.push({
        ageMonths: age,
        ageLabel,
        p25: refData?.p25 ?? null,
        p50: refData?.p50 ?? null,
        p75: refData?.p75 ?? null,
        childValue: null,
      });
    }

    // 사용자 데이터 병합
    records.forEach((record) => {
      const measureDate = new Date(record.measuredAt);
      const age = calculateAgeInMonths(birthDateObj, measureDate);
      const existingIdx = data.findIndex((d) => d.ageMonths === age);

      if (existingIdx !== -1) {
        data[existingIdx].childValue = record.value;
      }
    });

    // Y축 범위 계산
    const allValues = [
      ...data.map((d) => d.p25).filter((v): v is number => v !== null),
      ...data.map((d) => d.p75).filter((v): v is number => v !== null),
      ...data.map((d) => d.childValue).filter((v): v is number => v !== null),
    ];

    const min = allValues.length > 0 ? Math.min(...allValues) : 0;
    const max = allValues.length > 0 ? Math.max(...allValues) : 100;
    const padding = (max - min) * 0.15 || 5;

    return {
      chartData: data,
      yDomain: [Math.floor(min - padding), Math.ceil(max + padding)] as [number, number],
    };
  }, [gender, birthDate, records, config.data]);

  // 최신 데이터 포인트 정보
  const latestDataPoint = useMemo(() => {
    if (!latestRecord) return null;

    const date = new Date(latestRecord.measuredAt);
    const monthLabel = `${date.getMonth() + 1}월`;

    return {
      ageMonths: latestAgeMonths,
      value: latestRecord.value,
      label: monthLabel,
    };
  }, [latestRecord, latestAgeMonths]);

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
              <div className="w-full h-48 px-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ left: 0, right: 10, top: 20, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2d6a9f" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#2d6a9f" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey={config.data ? "ageMonths" : "month"}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickFormatter={(value) => {
                        if (!config.data) return value;
                        if (value < 24) return `${value}개월`;
                        const years = Math.floor(value / 12);
                        return `${years}세`;
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis domain={yDomain} hide />

                    {/* 기준 데이터: 25%~75% 범위를 영역으로 표시 */}
                    {config.data && (
                      <>
                        {/* 75% 라인까지의 영역 */}
                        <Area
                          type="monotone"
                          dataKey="p75"
                          stroke="none"
                          fill={`url(#gradient-${type})`}
                          fillOpacity={1}
                          isAnimationActive={false}
                        />
                        {/* 25% 라인 (점선) */}
                        <Line
                          type="monotone"
                          dataKey="p25"
                          stroke="#d1d5db"
                          strokeWidth={1}
                          strokeDasharray="4 4"
                          dot={false}
                          isAnimationActive={false}
                        />
                        {/* 50% 라인 (중앙값) */}
                        <Line
                          type="monotone"
                          dataKey="p50"
                          stroke="#9ca3af"
                          strokeWidth={1}
                          strokeDasharray="4 4"
                          dot={false}
                          isAnimationActive={false}
                        />
                        {/* 75% 라인 (점선) */}
                        <Line
                          type="monotone"
                          dataKey="p75"
                          stroke="#d1d5db"
                          strokeWidth={1}
                          strokeDasharray="4 4"
                          dot={false}
                          isAnimationActive={false}
                        />
                      </>
                    )}

                    {/* 사용자 데이터: 꺾은선 그래프 */}
                    <Line
                      type="monotone"
                      dataKey="childValue"
                      stroke="#163756"
                      strokeWidth={2}
                      dot={{ fill: "#163756", strokeWidth: 0, r: 4 }}
                      connectNulls
                      isAnimationActive={false}
                    />

                    {/* 최신 데이터 포인트 강조 */}
                    {latestDataPoint && latestDataPoint.ageMonths !== null && (
                      <ReferenceDot
                        x={latestDataPoint.ageMonths}
                        y={latestDataPoint.value ?? 0}
                        r={6}
                        fill="#163756"
                        stroke="white"
                        strokeWidth={2}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* 최신 데이터 라벨 */}
              {latestDataPoint && (
                <div className="flex justify-end w-full px-4 pb-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary text-white rounded text-xs">
                    <span>{latestDataPoint.label}</span>
                    <span>
                      {latestDataPoint.value}
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
