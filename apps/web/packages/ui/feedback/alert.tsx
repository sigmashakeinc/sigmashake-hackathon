"use client";

import type { ReactNode } from "react";
import { cn } from "@/packages/utils";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const variantStyles: Record<AlertVariant, string> = {
  info: "border-primary/30 bg-primary/5",
  success: "border-[#3fb950]/30 bg-[#3fb950]/5",
  warning: "border-[#d29922]/30 bg-[#d29922]/5",
  error: "border-error-container/30 bg-error-container/5",
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
  onDismiss,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "px-md py-sm text-body-sm rounded border",
        variantStyles[variant],
        className,
      )}
    >
      <div className="gap-sm flex items-start justify-between">
        <div>
          {title && (
            <p className="mb-xs text-on-surface font-medium">{title}</p>
          )}
          <div className="text-on-surface-variant">{children}</div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-on-surface-variant hover:text-on-surface mt-[2px] shrink-0 transition-colors"
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
