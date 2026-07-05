"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/packages/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "primary" | "secondary";
}

const sizeMap = {
  sm: "h-6 w-6 text-[14px]",
  md: "h-8 w-8 text-[18px]",
  lg: "h-10 w-10 text-[20px]",
};

const variantMap = {
  ghost:
    "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
  primary: "bg-primary text-on-primary hover:bg-[#c01826]",
  secondary:
    "border border-outline-variant text-on-surface-variant hover:border-on-surface hover:text-on-surface",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { label, size = "md", variant = "ghost", className, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center rounded transition-colors duration-150",
          "focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          sizeMap[size],
          variantMap[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
