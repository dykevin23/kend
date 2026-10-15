import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      // 시안: 채움 버튼의 비활성은 흐리게(opacity) 대신 연한 회청색 배경 + 연회색 글자
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-navy-800 active:bg-navy-800 disabled:bg-secondary disabled:text-gray-400",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 disabled:opacity-50",
        outline:
          "border-[1.5px] border-primary bg-background text-primary hover:bg-secondary active:bg-secondary disabled:border-gray-200 disabled:text-gray-400 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-navy-100 active:bg-navy-100 disabled:text-gray-400",
        accent:
          "bg-accent text-accent-foreground hover:bg-orange-600 active:bg-orange-600 disabled:bg-secondary disabled:text-gray-400",
        ghost:
          "hover:bg-secondary hover:text-primary dark:hover:bg-accent/50 disabled:opacity-50",
        link: "text-primary underline-offset-4 hover:underline disabled:opacity-50",
      },
      size: {
        default: "h-11 px-5 has-[>svg]:px-4",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-13 px-6 text-[15px] has-[>svg]:px-5",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    // CTA 그림자는 큰 채움 버튼에만 — 작은 버튼에 붙으면 무거워 보임
    compoundVariants: [
      {
        variant: "default",
        size: ["default", "lg"],
        class: "shadow-cta disabled:shadow-none",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
