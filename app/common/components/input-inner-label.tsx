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
        "rounded-xl border-[1.5px] bg-white",
        "transition-colors duration-200",
        isFocused ? "border-primary" : "border-gray-200",
        className
      )}
    >
      <label
        className={cn(
          "absolute left-4 pointer-events-none transition-all duration-200",
          "text-gray-500",
          isLabelFloating
            ? "top-3 text-xs font-semibold leading-none"
            : "top-1/2 -translate-y-1/2 text-[15px] leading-none"
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
            "flex-1 text-[15px] leading-none text-gray-900 outline-none bg-transparent",
            "transition-opacity duration-200",
            isLabelFloating ? "opacity-100" : "opacity-0"
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            className={cn(
              "shrink-0 transition-opacity duration-200",
              isLabelFloating ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            {showPassword ? (
              <EyeOff className="size-5 text-gray-400" />
            ) : (
              <Eye className="size-5 text-gray-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
