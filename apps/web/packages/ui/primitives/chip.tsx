"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/packages/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onRemove?: () => void;
}

export function Chip({
  className,
  selected,
  onRemove,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "gap-xs px-xs inline-flex items-center rounded-[2px] py-[2px] font-mono text-[10px] transition-colors duration-150",
        selected
          ? "border-primary/40 bg-primary/10 text-primary border"
          : "border-surface-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high border",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onRemove();
            }
          }}
          className="hover:text-primary ml-[2px] cursor-pointer text-current"
          aria-label="Remove"
        >
          ×
        </span>
      )}
    </button>
  );
}
