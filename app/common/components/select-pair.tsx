import SelectSheet, { type SelectSheetProps } from "./select-sheet";
import { Label } from "./ui/label";

interface SelectPairProps {
  label: string;
}

export default function SelectPair({
  label,
  value,
  options,
  placeholder,
  onChange,
}: SelectPairProps & SelectSheetProps) {
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex px-1 items-center gap-2.5 self-stretch">
        <Label className="text-base font-medium">{label}</Label>
      </div>
      <SelectSheet
        value={value}
        options={options}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}
