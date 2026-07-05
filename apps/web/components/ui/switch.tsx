"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  className,
}: SwitchProps) {
  return (
    <label
      className={cn(
        "gap-sm inline-flex items-center",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-150",
          "focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2",
          checked
            ? "border-primary bg-primary"
            : "border-outline-variant bg-surface-container-high",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 rounded-full bg-white transition-transform duration-150",
            checked ? "translate-x-[18px]" : "translate-x-[1px]",
            "mt-[1px]",
          )}
        />
      </button>
      {label && <span className="text-body-sm text-on-surface">{label}</span>}
    </label>
  );
}
