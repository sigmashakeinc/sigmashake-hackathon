"use client";

import { cn } from "@/packages/utils";

interface TrendChartProps {
  data: { date: string; count: number }[];
  height?: number;
  className?: string;
  color?: string;
}

export function TrendChart({ data, height = 60, className, color = "var(--color-primary)" }: TrendChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.count), 1);
  const points = data.map((d, i) => ({
    x: `${(i / Math.max(data.length - 1, 1)) * 100}%`,
    y: height - ((d.count / max) * (height - 8)) - 4,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className={cn("relative", className)} style={{ height }} role="img" aria-label="Trend chart">
      <svg viewBox={`0 0 ${data.length * 10} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`grad-${color.replace(/[^a-zA-Z]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={`${pathD} L 100% ${height} L 0 ${height} Z`} fill={`url(#grad-${color.replace(/[^a-zA-Z]/g, "")})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; maxValue?: number }[];
  height?: number;
  className?: string;
}

export function BarChart({ data, height = 120, className }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("flex items-end gap-xs", className)} style={{ height }} role="img" aria-label="Bar chart">
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-[2px]">
            <span className="font-mono text-[9px] text-on-surface-variant">{d.value}</span>
            <div
              className="w-full rounded-t-sm bg-primary transition-all duration-500"
              style={{ height: `${Math.max(pct, 2)}%` }}
              role="progressbar"
              aria-valuenow={d.value}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-label={d.label}
            />
            <span className="truncate font-mono text-[8px] text-on-surface-variant" style={{ maxWidth: "100%" }}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface StatusBarProps {
  data: { label: string; count: number; color: string }[];
  height?: number;
}

export function StatusBar({ data, height = 24 }: StatusBarProps) {
  const total = data.reduce((a, d) => a + d.count, 0);
  if (total === 0) return null;

  return (
    <div className="flex w-full overflow-hidden rounded-sm" style={{ height }} role="img" aria-label="Status distribution">
      {data.map((d) => {
        const pct = Math.max((d.count / total) * 100, 0.5);
        return (
          <div
            key={d.label}
            className="flex items-center justify-center transition-all duration-300 first:rounded-l-sm last:rounded-r-sm"
            style={{ width: `${pct}%`, backgroundColor: d.color }}
            title={`${d.label}: ${d.count}`}
          >
            {pct > 10 && <span className="font-mono text-[9px] font-medium text-white">{d.count}</span>}
          </div>
        );
      })}
    </div>
  );
}

export const STATUS_COLORS: Record<string, string> = {
  done: "var(--color-success, #22c55e)",
  completed: "var(--color-success, #22c55e)",
  testing: "var(--color-info, #3b82f6)",
  review: "var(--color-warning, #f59e0b)",
  in_progress: "var(--color-info, #3b82f6)",
  active: "var(--color-info, #3b82f6)",
  blocked: "var(--color-error, #e01e2e)",
  todo: "var(--color-on-surface-variant, #6b7280)",
  backlog: "var(--color-surface-variant, #9ca3af)",
  pending: "var(--color-surface-variant, #9ca3af)",
  draft: "var(--color-surface-variant, #9ca3af)",
};
