"use client";

import { cn } from "@/packages/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({ label, value, max, color, showLabel = true, size = "md" }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className="flex flex-col gap-[4px]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="flex items-center justify-between">
        <span className={cn("text-on-surface-variant", size === "sm" ? "font-mono text-[10px]" : "text-body-xs")}>{label}</span>
        {showLabel && <span className="font-mono text-[11px] text-on-surface">{pct}%</span>}
      </div>
      <div className={cn("w-full overflow-hidden rounded-full bg-surface-container-highest", size === "sm" ? "h-1.5" : "h-2")}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", color ?? "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface ProgressSectionProps {
  title: string;
  items: { label: string; value: number; max: number; color?: string }[];
}

export function ProgressSection({ title, items }: ProgressSectionProps) {
  return (
    <div className="flex flex-col gap-sm" role="group" aria-label={title}>
      <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{title}</h3>
      <div className="flex flex-col gap-xs">
        {items.map((item) => (
          <ProgressBar key={item.label} {...item} size="sm" />
        ))}
      </div>
    </div>
  );
}

interface DonutChartProps {
  value: number;
  max: number;
  label: string;
  size?: number;
}

export function DonutChart({ value, max, label, size = 80 }: DonutChartProps) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-xs" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-container-highest)" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="font-mono text-[11px] font-bold text-on-surface">{pct}%</span>
      <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">{label}</span>
    </div>
  );
}
