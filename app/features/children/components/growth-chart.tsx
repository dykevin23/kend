import { Area, AreaChart, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/common/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function GrowthChart() {
  return (
    <div className="flex flex-col items-center gap-4 self-stretch">
      <div className="flex items-center gap-2.5 self-stretch">
        <span className="text-base leading-[100%] tracking-[-0.2px] text-muted-foreground">
          신장
        </span>
      </div>
      <div className="flex w-full pb-8 flex-col items-start gap-2.5 border-b-1 border-b-muted-foreground/30">
        <div className="flex w-full pt-6 flex-col items-start gap-12 rounded-2xl bg-white border-1 border-muted-foreground/30">
          <div className="flex flex-col items-start gap-6 self-stretch">
            <div className="flex px-4 items-center gap-2.5 self-stretch">
              <span className="text-base leading-[100%]">신장 성장 그래프</span>
            </div>
            <div className="flex px-4 flex-col justify-center items-start gap-2 self-stretch">
              <span className="text-sm leading-[100%] text-muted-foreground">
                Chee-mee의 키는
              </span>
              <span className="text-base leading-[100%]">
                친구들 100명 중 5등 이에요!
              </span>
            </div>
          </div>

          {/* 그래프 */}
          <div className="flex flex-col items-start self-stretch">
            <div className="flex flex-col w-full justify-center items-center gap-4">
              <ChartContainer
                config={chartConfig}
                className="w-screen px-8 h-1/2"
              >
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  {/* <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                /> */}
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <defs>
                    <linearGradient
                      id="fillDesktop"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-desktop)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-desktop)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-mobile)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-mobile)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="url(#fillMobile)"
                    fillOpacity={0.4}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="url(#fillDesktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
