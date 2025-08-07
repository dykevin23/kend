import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import type { ChatFilterType } from "../constrants";

const filters: { label: string; value: ChatFilterType }[] = [
  { label: "전체", value: "" },
  { label: "구매", value: "purchase" },
  { label: "판매", value: "sale" },
  { label: "완료", value: "done" },
];

export default function Filter({
  filter,
  onChange,
}: {
  filter: ChatFilterType;
  onChange: (filter: ChatFilterType) => void;
}) {
  return (
    <div className="flex py-4 pl-4 items-start gap-2">
      <div className="flex flex-col items-start gap-2.5 grow shrink-0 basis-0">
        <div className="flex pr-2 items-center gap-2 self-stretch">
          {filters.map((item) => (
            <Button
              className={cn([
                "flex h-8 px-3 justify-center items-center gap-2.5 rounded-full",
                "font-pretendard text-sm not-italic font-medium leading-3.5 tracking-[-0.2px]",
                filter === item.value
                  ? "bg-black text-white"
                  : "bg-muted text-black",
              ])}
              onClick={() => onChange(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
