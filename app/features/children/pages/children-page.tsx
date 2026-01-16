import { Badge } from "~/common/components/ui/badge";
import ChildCard from "../components/child-card";
import { ChevronRight } from "lucide-react";
import GrowthChart from "../components/growth-chart";

export default function ChildrenPage() {
  return (
    <div>
      <ChildCard />

      <div className="flex w-full px-4 flex-col justify-center items-center gap-2.5">
        <div className="flex w-full py-4 flex-col items-start gap-6 rounded-2xl bg-white border-1 border-muted-foreground/30">
          <div className="flex px-4 items-center gap-6 self-stretch">
            <div className="flex flex-col justify-center items-start gap-2 flex-gsb">
              <span className="text-sm leading-[100%] text-muted">
                Chee-mee의 성장속도는
              </span>
              <span className="text-base leading-[100%]">
                또래 보다 빨라요!
              </span>
            </div>
            <Badge variant="secondary">100명 중 10등</Badge>
          </div>
          <div className="flex flex-col items-start gap-4 self-stretch">
            <div className="min-h-20 self-stretch px-5 flex items-center">
              <div className="w-full h-3.5 shrink-0 rounded-full bg-secondary/10"></div>
            </div>
            <div className="flex p-4 flex-col items-start gap-2 self-stretch">
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex h-8 px-3 justify-between items-center flex-gsb rounded-full bg-muted/10">
                  <span className="text-sm leading-[100%] text-muted-foreground">
                    신장
                  </span>
                  <span className="text-sm leading-[100%] text-muted-foreground">
                    100.1cm
                  </span>
                </div>
                <div className="flex h-8 px-3 justify-between items-center flex-gsb rounded-full bg-muted/10">
                  <span className="text-sm leading-[100%] text-muted-foreground">
                    머리둘레
                  </span>
                  <span className="text-sm leading-[100%] text-muted-foreground">
                    48.2cm
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex h-8 px-3 justify-between items-center flex-gsb rounded-full bg-muted/10">
                  <span className="text-sm leading-[100%] text-muted-foreground">
                    신장
                  </span>
                  <span className="text-sm leading-[100%] text-muted-foreground">
                    100.1cm
                  </span>
                </div>
                <div className="flex h-8 px-3 justify-between items-center flex-gsb rounded-full bg-muted/10">
                  <span className="text-sm leading-[100%] text-muted-foreground">
                    머리둘레
                  </span>
                  <span className="text-sm leading-[100%] text-muted-foreground">
                    48.2cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start pt-8 px-4 gap-4">
        <div className="flex items-center gap-2.5 self-stretch">
          <span className="text-xl leading-[100%] tracking-[-0.2px] flex-gsb">
            성장 그래프
          </span>
          <div className="flex justify-center items-center gap-2.5">
            <span className="text-sm leading-[100%] tracking-[-0.2px]">
              최신 정보 입력
            </span>
            <ChevronRight size={16} />
          </div>
        </div>

        <div className="flex flex-col items-start gap-6 self-stretch">
          <GrowthChart />
          <GrowthChart />
          <GrowthChart />
        </div>
      </div>
    </div>
  );
}
