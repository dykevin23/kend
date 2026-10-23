import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "~/lib/utils";

type TextFieldProps = {
  label?: string;
  /** 바깥 래퍼 여백 조정용 (기본 p-4) */
  containerClassName?: string;
  multiline?: boolean;
  rows?: number;
} & (
  | ({ multiline?: false } & InputHTMLAttributes<HTMLInputElement>)
  | ({ multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>)
);

export default function TextField({
  label,
  multiline = false,
  rows = 4,
  className,
  containerClassName,
  ...rest
}: TextFieldProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-4 justify-center items-start gap-2 self-stretch",
        containerClassName
      )}
    >
      {label && (
        <Label
          htmlFor={rest.id}
          className={cn(
            "flex px-1 items-center gap-2.5 self-stretch",
            "text-[13.5px] font-bold leading-none text-gray-700"
          )}
        >
          {label}
        </Label>
      )}
      {multiline ? (
        <textarea
          rows={rows}
          className={cn(
            "flex w-full px-4 py-3 items-start gap-2.5 self-stretch",
            "text-sm leading-[140%] resize-none",
            "rounded-xl border-[1.5px] border-gray-200 bg-white",
            "placeholder:text-gray-400",
            "focus-visible:outline-none focus-visible:border-primary",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <Input
          className={cn(
            "flex h-13 px-4 items-center gap-2.5 self-stretch",
            "rounded-xl border-[1.5px] border-gray-200 bg-white shadow-none",
            "text-[15px] leading-none placeholder:text-gray-400",
            "focus-visible:border-primary focus-visible:ring-0",
            className
          )}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
}
