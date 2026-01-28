import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface InputWithLabelProps {
  label: string;
  placeholder: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  type?: string;
}

export default function InputWithLabel({
  label,
  placeholder,
  name,
  value,
  defaultValue,
  onChange,
  disabled,
  type = "text",
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
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        type={type}
      />
    </div>
  );
}
