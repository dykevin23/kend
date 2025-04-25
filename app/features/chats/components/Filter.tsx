import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";

export default function Filter({
  filter,
  onChange,
}: {
  filter: string;
  onChange: (filter: string) => void;
}) {
  return (
    <div className="flex py-4 pl-4 items-start gap-2">
      <div className="flex flex-col items-start gap-2.5 grow shrink-0 basis-0">
        <div className="flex pr-2 items-center gap-2 self-stretch">
          <Button
            className={cn([
              "flex h-8 px-3 justify-center items-center gap-2.5 rounded-full text-sm font-medium -tracking-[0.2px]",
              filter !== "" && "bg-accent text-primary",
            ])}
            onClick={() => onChange("")}
          >
            전체
          </Button>
          <Button
            className={cn([
              "flex h-8 px-3 justify-center items-center gap-2.5 rounded-full text-sm font-medium -tracking-[0.2px]",
              filter !== "purchase" && "bg-accent text-primary",
            ])}
            onClick={() => onChange("purchase")}
          >
            구매
          </Button>
          <Button
            className={cn([
              "flex h-8 px-3 justify-center items-center gap-2.5 rounded-full text-sm font-medium -tracking-[0.2px]",
              filter !== "sale" && "bg-accent text-primary",
            ])}
            onClick={() => onChange("sale")}
          >
            판매
          </Button>
          <Button
            className={cn([
              "flex h-8 px-3 justify-center items-center gap-2.5 rounded-full text-sm font-medium -tracking-[0.2px]",
              filter !== "done" && "bg-accent text-primary",
            ])}
            onClick={() => onChange("done")}
          >
            완료
          </Button>
        </div>
      </div>
    </div>
  );
}
