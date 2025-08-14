import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "~/lib/utils";
import { ChevronDown } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { DateTime } from "luxon";

interface CalendarSheetProps {
  value?: string;
  placeholder?: string;
  onChange: (v: string) => void;
}

export default function CalendarSheet({
  value,
  placeholder = "",
  onChange,
}: CalendarSheetProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <Sheet open={visible}>
      <SheetTrigger
        className="flex w-full h-14 px-4 items-center gap-2.5 self-stretch rounded-md border border-muted"
        onClick={() => setVisible(true)}
      >
        <div className="flex items-start grow shrink-0 basis-0">
          <span
            className={cn([
              "text-sm font-medium leading-3.5 text-muted-foreground/30",
              value && "text-black",
            ])}
          >
            {value
              ? DateTime.fromISO(value).toFormat("yyyy.MM.dd")
              : placeholder}
          </span>
        </div>
        <ChevronDown className="size-4" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex flex-col w-full items-start rounded-t-3xl"
      >
        <div className="flex flex-col w-full justify-center items-center gap-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(v) => setDate(v)}
          />
          <div className="flex w-full justify-center items-center gap-3 px-4 mx-4 pb-4">
            <Button
              size="lg"
              className="w-1/2"
              variant="outline"
              onClick={() => setVisible(false)}
            >
              취소
            </Button>
            <Button
              size="lg"
              className="w-1/2"
              onClick={() => {
                if (date) {
                  onChange(DateTime.fromJSDate(date).toFormat("yyyyMMdd"));
                  setVisible(false);
                }
              }}
            >
              확인
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
