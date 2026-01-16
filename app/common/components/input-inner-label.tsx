import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface InputInnerLabelProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function InputInnerLabel({
  label,
  type = "text",
  className,
  ...props
}: InputInnerLabelProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const isLabelFloating = isFocused || hasValue;

  return (
    <div
      className={cn(
        "flex flex-col self-stretch px-4 py-3 gap-2 relative",
        "border",
        "transition-all duration-200",
        isFocused ? "border-accent z-10" : "border-secondary z-0",
        className
      )}
    >
      <label
        className={cn(
          "absolute left-4 pointer-events-none transition-all duration-200",
          "tracking-[-0.4px] text-black/60",
          isLabelFloating
            ? "top-3 text-sm leading-[100%]"
            : "top-1/2 -translate-y-1/2 text-base leading-[100%]"
        )}
      >
        {label}
      </label>
      <div className="flex items-center gap-2 self-stretch relative pt-5">
        <input
          {...props}
          type={inputType}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          className={cn(
            "flex-1 text-base leading-[100%] tracking-[-0.4px] text-black outline-none bg-transparent",
            "transition-opacity duration-200",
            isLabelFloating ? "opacity-100" : "opacity-0"
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              "shrink-0 transition-opacity duration-200",
              isLabelFloating ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            {showPassword ? (
              <EyeOff className="size-6 text-black/60" />
            ) : (
              <Eye className="size-6 text-black/60" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
