import { cn } from "~/lib/utils";

interface OptionChip {
  label: string;
  value: string;
  disabled?: boolean;
}

interface OptionChipGroupItem {
  triggerLabel: string;
  value: string;
  options: OptionChip[];
}

interface OptionChipsProps {
  items: OptionChipGroupItem[];
  values: { [key: string]: string };
  onChange: (value: string, parent: string) => void;
}

/** 옵션 그룹별 칩 선택 (시안: 옵션 시트) — 선택 불가 옵션은 숨기지 않고 회색 처리 */
export const OptionChips = ({ items, values, onChange }: OptionChipsProps) => {
  return (
    <div className="flex w-full flex-col gap-4">
      {items.map((item) => (
        <div key={item.value} className="flex flex-col gap-2.5">
          <span className="text-[13.5px] font-extrabold text-gray-900">
            {item.triggerLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {item.options.map((option) => {
              const selected = values[item.value] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  aria-pressed={selected}
                  onClick={() => onChange(option.value, item.value)}
                  className={cn(
                    "px-4 py-[9px] rounded-full border-[1.5px] text-[13px] font-bold transition-colors",
                    selected
                      ? "border-primary bg-navy-50 text-primary"
                      : "border-gray-200 bg-white text-gray-700",
                    option.disabled &&
                      "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
