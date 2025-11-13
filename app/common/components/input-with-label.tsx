import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface InputWithLabelProps {
  label: string;
  placeholder: string;
}

export default function InputWithLabel({
  label,
  placeholder,
}: InputWithLabelProps) {
  return (
    <div className="flex px-4 items-center gap-1 self-stretch">
      <Label
        className={cn(
          "flex w-20 px-1 items-center gap-2.5",
          "text-base leading-4"
        )}
      >
        {label}
      </Label>
      <Input
        className={cn(
          "flex py-2.5 px-2 items-center gap-2 flex-gsb rounded-lg bg-muted/10",
          "text-sm leading-3.5"
        )}
        placeholder={placeholder}
      />
    </div>
  );
}
