import type { InputHTMLAttributes } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { cn } from "~/lib/utils";

export default function InputPair({
  label,
  textArea,
  ...rest
}: {
  label: string;
  textArea?: boolean;
} & InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>) {
  return (
    <div className="flex px-4 py-2 flex-col justify-center items-start gap-2 self-stretch">
      <Label
        htmlFor={rest.id}
        className={cn([
          "text-base font-medium leading-4",
          !rest.value ? "" : "text-muted-foreground/50",
        ])}
      >
        {label}
      </Label>

      {textArea ? (
        <Textarea
          className={cn([
            "resize-none",
            "px-4 h-60",
            "placeholder:text-sm placeholder:font-medium placeholder:leading-5.5 placeholder:text-muted-foreground/50",
          ])}
          {...rest}
        />
      ) : (
        <Input
          className={cn([
            "h-14 px-4",
            "placeholder:text-sm placeholder:font-medium placeholder:leading-3.5 placeholder:text-muted-foreground/50",
          ])}
          {...rest}
        />
      )}
    </div>
  );
}
