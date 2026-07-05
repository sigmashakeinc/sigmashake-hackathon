import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default:
    "bg-surface-container-high text-on-surface-variant border border-surface-variant",
  primary: "bg-primary/10 text-primary border border-primary/20",
  success: "bg-[#238636]/10 text-[#3fb950] border border-[#238636]/20",
  warning: "bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/20",
  error: "bg-error-container/30 text-error border border-error-container/30",
  outline:
    "border border-outline-variant text-on-surface-variant bg-transparent",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "px-xs inline-flex items-center rounded py-[2px] font-mono text-[10px] leading-none font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
