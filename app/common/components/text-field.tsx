import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "~/lib/utils";

type TextFieldProps = {
  label?: string;
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
  ...rest
}: TextFieldProps) {
  return (
    <div className="flex flex-col p-4 justify-center items-start gap-2 self-stretch">
      {label && (
        <Label
          htmlFor={rest.id}
          className={cn(
            "flex px-1 items-center gap-2.5 self-stretch",
            "text-base leading-[100%]"
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
            "rounded-md border border-input bg-transparent shadow-xs",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <Input
          className={cn(
            "flex h-14 px-4 items-center gap-2.5 self-stretch",
            "text-sm leading-[100%]",
            className
          )}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
}
