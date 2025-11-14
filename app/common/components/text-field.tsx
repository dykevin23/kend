import type { InputHTMLAttributes } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "~/lib/utils";

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
}

export default function TextField({ label, ...rest }: TextFieldProps) {
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
      <Input
        className={cn(
          "flex h-14 px-4 items-center gap-2.5 self-stretch",
          "text-sm leading-[100%]"
        )}
        {...rest}
      />
    </div>
  );
}
