import { useState } from "react";
import BottomSheet from "./bottom-sheet";
import { cn } from "~/lib/utils";

interface SelectOptions {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  placeholder: string;
  options: SelectOptions[];
  onChange: (v: string) => void;
}

export default function Select({
  value,
  options,
  placeholder,
  onChange,
}: SelectProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleSelect = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <>
      <div
        className="flex h-14 px-4 items-center gap-2.5 self-stretch rounded-xl border-1 border-muted/30"
        onClick={() => setOpen(true)}
      >
        <span
          className={cn(
            "text-sm leading-[100%] flex-gsb",
            value ? "text-black" : "text-muted"
          )}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M2.76341 5.48984L2.82341 5.55984L7.35675 10.7798C7.51008 10.9565 7.74008 11.0665 7.99675 11.0665C8.25341 11.0665 8.48341 10.9532 8.63675 10.7798L13.1667 5.56984L13.2434 5.48317C13.3001 5.39984 13.3334 5.29984 13.3334 5.19317C13.3334 4.90317 13.0867 4.6665 12.7801 4.6665H3.22008C2.91341 4.6665 2.66675 4.90317 2.66675 5.19317C2.66675 5.30317 2.70341 5.4065 2.76341 5.48984Z"
            fill="black"
          />
        </svg>
      </div>

      <BottomSheet open={open} setOpen={setOpen}>
        <div className="flex w-full flex-col items-start">
          {options.map(({ label, value: optionValue }: SelectOptions) => (
            <div
              className="flex h-14 pt-2.5 px-6 items-center gap-2.5 self-stretch border-b-1 border-b-muted/30"
              onClick={() => handleSelect(optionValue)}
            >
              <span
                className={cn(
                  "text-base leading-[140%] tracking-[-0.4px] flex-gsb",
                  {
                    "text-muted-foreground/50": value && value !== optionValue,
                    "text-black": !value || value === optionValue,
                  }
                )}
              >
                {label}
              </span>
              {optionValue === value && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M18.3001 6.3L9.10007 16.4L6.80007 13.4C6.50007 13 5.80007 12.9 5.40007 13.2C5.00007 13.5 4.90007 14.2 5.20007 14.6L8.20007 18.6C8.40007 18.8 8.70007 19 9.00007 19C9.30007 19 9.50007 18.9 9.70007 18.7L19.7001 7.7C20.1001 7.3 20.0001 6.7 19.6001 6.3C19.3001 5.9 18.6001 5.9 18.3001 6.3Z"
                    fill="#163E64"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
