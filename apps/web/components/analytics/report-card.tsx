"use client";

import { cn } from "@/packages/utils";

interface ReportCardProps {
  label: string;
  description: string;
  icon: string;
  onGenerate: () => void;
  disabled?: boolean;
}

export function ReportCard({ label, description, icon, onGenerate, disabled }: ReportCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-md rounded border border-outline-variant/30 bg-surface-container p-md transition-all duration-150",
        disabled ? "opacity-50" : "hover:border-outline-variant/60"
      )}
      role="region"
      aria-label={label}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
        <span className="material-symbols-outlined text-[20px] text-primary">{icon}</span>
      </div>
      <div className="flex flex-1 flex-col gap-[2px]">
        <span className="text-body-sm font-medium text-on-surface">{label}</span>
        <span className="text-body-xs text-on-surface-variant">{description}</span>
      </div>
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled}
        className="flex h-8 items-center rounded bg-primary px-sm text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:pointer-events-none disabled:opacity-50"
      >
        Generate
      </button>
    </div>
  );
}
