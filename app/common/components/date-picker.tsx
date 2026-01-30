"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "~/common/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/common/components/ui/popover";
import { cn } from "~/lib/utils";
import { useState } from "react";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  maxDate?: Date;
  minDate?: Date;
  disabled?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "날짜를 선택해주세요",
  maxDate,
  minDate,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  // string을 Date로 변환
  const selectedDate = value ? new Date(value) : undefined;

  // Date를 YYYY-MM-DD string으로 변환
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex h-14 px-4 items-center gap-2.5 self-stretch w-full",
            "rounded-xl border border-muted/30",
            "text-left text-sm",
            disabled && "opacity-50 cursor-not-allowed",
            !value && "text-muted"
          )}
        >
          <span className="flex-1">
            {selectedDate
              ? format(selectedDate, "yyyy. MM. dd", { locale: ko })
              : placeholder}
          </span>
          <CalendarIcon size={20} className="text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          defaultMonth={selectedDate}
          locale={ko}
          captionLayout="dropdown"
          startMonth={new Date(2010, 0)}
          endMonth={new Date(new Date().getFullYear() + 1, 11)}
        />
      </PopoverContent>
    </Popover>
  );
}
