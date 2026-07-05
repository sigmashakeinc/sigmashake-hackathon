import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onRemove?: () => void;
  removable?: boolean;
}

export function Tag({
  className,
  selected,
  onRemove,
  removable,
  children,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "gap-xs px-xs inline-flex items-center rounded py-[2px] font-mono text-[10px] transition-colors duration-150",
        selected
          ? "border-primary bg-primary/10 text-primary border"
          : "border-surface-variant bg-surface-container text-on-surface-variant hover:border-on-surface-variant border",
        className,
      )}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="hover:text-primary ml-[2px] inline-flex items-center justify-center text-current"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
