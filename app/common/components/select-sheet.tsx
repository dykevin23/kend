import { Check, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface SelectOptionsProps {
  label: string;
  value: string;
}

export interface SelectSheetProps {
  value: string;
  options: SelectOptionsProps[];
  placeholder: string;
  onChange: (v: string) => void;
}

export default function SelectSheet({
  value,
  options,
  placeholder,
  onChange,
}: SelectSheetProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const onSelect = (selected: string) => {
    onChange(selected);
    setVisible(false);
  };
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
              ? options.find((option) => option.value === value)?.label
              : placeholder}
          </span>
        </div>
        <ChevronDown className="size-4" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex flex-col w-full pb-[176px] items-start rounded-t-3xl"
      >
        <div className="w-full">
          <div className="flex w-full h-8 flex-col justify-center items-center gap-2.5 rounded-t-[40px]">
            <div className="w-16 h-1 shrink-0 rounded-full"></div>
          </div>
          {options.map((option) => (
            <div
              key={option.value}
              className="flex h-14 py-2.5 px-6 items-center justify-between gap-2.5 self-stretch border-b-1 grow shrink-0 basis-0"
              onClick={() => onSelect(option.value)}
            >
              <span className="text-base font-semibold leading-[22.4px] -tracking-[0.4px]">
                {option.label}
              </span>
              {option.value === value && (
                <Check className="size-6 aspect-square" />
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
