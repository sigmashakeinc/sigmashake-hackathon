import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-on-primary hover:bg-[#c01826] active:bg-[#a01420]",
  secondary:
    "border border-outline-variant bg-black text-on-surface hover:border-on-surface active:bg-surface-container",
  ghost:
    "text-on-surface-variant hover:bg-surface-container-hover: text-on-surface active:bg-surface-container-high",
} as const;

const sizes = {
  sm: "px-sm py-xs text-body-sm gap-xs",
  md: "px-md py-sm text-body-sm gap-sm",
  lg: "px-lg py-md text-body-lg gap-sm",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded font-medium transition-colors duration-150",
          "focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
