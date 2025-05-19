import { ChevronRight, Plus, Settings } from "lucide-react";
import { Link, NavLink } from "react-router";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import Header from "~/common/components/header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";
import { buttonVariants } from "~/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/common/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/common/components/ui/chart";
import { cn } from "~/lib/utils";

const chartData = [
  { height: 27 },
  { height: 30 },
  { height: 32 },
  { height: 35 },
  { height: 40 },
  { height: 49 },
];

const chartConfig = {
  height: {
    label: "Height",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function ChildPage() {
  return (
    <div>
      <Header title="데이터" />
      <div className="bg-muted/30">
        <div className="flex w-full py-4 pl-4 items-start gap-2">
          <div className="flex h-8 px-3 justify-center items-center gap-2.5 rounded-full bg-muted">
            <Link to="/children/submit">
              <Plus className="size-4 aspect-square" />
            </Link>
          </div>
          <div className="flex flex-col items-start gap-2.5 grow shrink-0 basis-0">
            <div className="flex pr-2 items-center gap-2 self-stretch">
              {[
                { id: 1, name: "첫째" },
                { id: 2, name: "둘째" },
                { id: 3, name: "셋째" },
              ].map((item) => (
                <NavLink
                  key={item.id}
                  className={({ isActive }) =>
                    cn(
                      buttonVariants(),
                      "flex h-8 px-3 justify-center items-center gap-2.5 rounded-full",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-muted text-primary"
                    )
                  }
                  to={`/children/${item.id}`}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full p-4 items-center gap-2">
          <div className="flex items-center gap-2 grow shrink-0 basis-0 self-stretch">
            <Avatar className="size-12 aspect-square">
              <AvatarFallback>N</AvatarFallback>
              <AvatarImage src="http://github.com/messi.png" />
            </Avatar>
            <div className="flex flex-col justify-center items-start gap-2 grow shrink-0 basis-0">
              <div className="flex justify-between items-center self-stretch grow shrink-0 basis-0">
                <span className="text-base font-bold">첫째아이닉네임</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground/50">
                  김로운
                </span>
                <span className="text-sm font-medium text-muted-foreground/50">
                  2022. 01. 06
                </span>
              </div>
            </div>
          </div>
          <Settings className="size-7 aspect-square" />
        </div>

        <div className="flex w-full px-4 flex-col justify-center items-center gap-2.5">
          <div className="flex w-full px-4 flex-col items-start gap-6 rounded-2xl bg-white border border-muted/50">
            <div className="flex px-4 items-center gap-6 self-stretch">
              <div className="flex flex-col justify-center items-start gap-2 grow shrink-0 basis-0">
                <span className="text-sm text-muted-foreground/50">
                  우리아이 땡이는 잠만자는
                </span>
                <span className="text-base font-semibold">
                  또래 보다 성장 속도가 빨라요!
                </span>
              </div>

              <div className="flex h-6 px-2 justify-center items-center gap-2.5 rounded-xl">
                <span className="text-sm font-semibold">100명 중 10등</span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 self-stretch">
              <div className="h-20 self-stretch">
                <div className="w-[290px] h-3.5 shrink-0 rounded-full bg-primary/10"></div>
              </div>

              <div className="flex flex-col p-4 gap-2 items-start self-stretch">
                <div className="flex items-center gap-2 self-stretch">
                  <div className="flex h-8 px-3 justify-between items-center grow shrink-0 basis-0 rounded-full bg-muted">
                    <span className="text-sm font-medium">신장</span>
                    <span className="text-sm font-medium">156.9cm</span>
                  </div>

                  <div className="flex h-8 px-3 justify-between items-center grow shrink-0 basis-0 rounded-full bg-muted">
                    <span className="text-sm font-medium">신장</span>
                    <span className="text-sm font-medium">156.9cm</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch">
                  <div className="flex h-8 px-3 justify-between items-center grow shrink-0 basis-0 rounded-full bg-muted">
                    <span className="text-sm font-medium">신장</span>
                    <span className="text-sm font-medium">156.9cm</span>
                  </div>

                  <div className="flex h-8 px-3 justify-between items-center grow shrink-0 basis-0 rounded-full bg-muted">
                    <span className="text-sm font-medium">신장</span>
                    <span className="text-sm font-medium">156.9cm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex px-4 items-center gap-2.5 self-stretch">
            <div className="grow shrink-0 basis-0">
              <span className="text-xl font-semibold">성장 그래프</span>
            </div>

            <div className="flex justify-center items-center gap-2.5">
              <span className="text-sm font-medium">최신 정보 입력</span>
              <ChevronRight className="size-4 aspect-square" />
            </div>
          </div>

          <div className="flex flex-col items-start gap-6 self-stretch">
            <div className="flex flex-col items-center gap-4 self-stretch">
              <div className="flex px-4 items-center gap-2.5 self-stretch">
                <span className="text-base font-semibold">신장</span>
              </div>

              <div className="flex w-full p-8 flex-col items-start gap-2.5 border-b border-b-muted-foreground">
                <Card className="flex w-full">
                  <CardHeader className="flex flex-col items-start gap-6 self-stretch">
                    <CardTitle className="flex px-4 items-center gap-2.5 self-stretch">
                      <span className="text-base font-semibold">
                        신장 성장 그래프
                      </span>
                    </CardTitle>
                    <CardDescription className="flex px-4 flex-col justify-center items-start gap-2 self-stretch">
                      <span className="text-sm text-muted-foreground/50">
                        우리 꼬맹이의 키는
                      </span>
                      <span className="text-base font-semibold">
                        친구들 100명 중 5등 이에요!
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                          left: 12,
                          right: 12,
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
                            id="fillHeight"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--color-height)"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--color-height)"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          dataKey="height"
                          type="natural"
                          fill="url(#fillHeight)"
                          fillOpacity={0.4}
                          stroke="var(--color-height)"
                          stackId="a"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
