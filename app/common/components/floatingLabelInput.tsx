import type { InputHTMLAttributes } from "react";
import { Input } from "./ui/input";
import { cn } from "~/lib/utils";

export default function FloatingLabelInput({
  label,
  id,
  className,
  ...rest
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative flex items-start self-stretch">
      <Input
        id={id}
        placeholder=" "
        className={cn(
          "flex h-16 px-4 justify-center items-center gap-1 self-stretch text-white border-muted/30",
          "peer placeholder-transparent focus-visible:border focus-visible:border-primary-foreground",
          "focus-visible: items-start focus-visible: flex-col",
          className
        )}
        {...rest}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-4 top-6 font-pretendard text-base leading-5.5 tracking-[-0.3px] text-muted/50 transition-all",
          "peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted/50",
          "peer-focus:top-3 peer-focus:text-xs peer-focus:text-muted/50"
        )}
      >
        {label}
      </label>
    </div>
  );
}
