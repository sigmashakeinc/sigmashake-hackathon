"use client";

import { cn } from "@/packages/utils";

type BannerVariant = "info" | "success" | "warning" | "error";

interface BannerProps {
  variant?: BannerVariant;
  message: string;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<BannerVariant, string> = {
  info: "bg-primary/10 border-b border-primary/20 text-primary",
  success: "bg-[#3fb950]/10 border-b border-[#3fb950]/20 text-[#3fb950]",
  warning: "bg-[#d29922]/10 border-b border-[#d29922]/20 text-[#d29922]",
  error: "bg-error-container/10 border-b border-error-container/20 text-error",
};

export function Banner({
  variant = "info",
  message,
  action,
  onDismiss,
  className,
}: BannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "px-md text-body-sm flex h-9 items-center justify-between",
        variantStyles[variant],
        className,
      )}
    >
      <span>{message}</span>
      <div className="gap-md flex items-center">
        {action && (
          <button
            onClick={action.onClick}
            className="font-medium underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            {action.label}
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="opacity-70 transition-opacity hover:opacity-100"
            aria-label="Dismiss"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
