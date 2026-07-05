"use client";

import { cn } from "@/packages/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon?: string;
  className?: string;
}

export function MetricCard({ label, value, subtitle, trend, trendLabel, icon, className }: MetricCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-error",
    neutral: "text-on-surface-variant",
  };

  return (
    <div className={cn("flex flex-col gap-sm rounded border border-outline-variant/30 bg-surface-container p-md", className)} role="region" aria-label={label}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        {icon && <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-xs">
        <span className="text-h3 font-semibold text-on-surface">{value}</span>
        {trend && (
          <span className={cn("flex items-center gap-[2px] font-mono text-[11px]", trendColors[trend])}>
            <span className="material-symbols-outlined text-[14px]">
              {trend === "up" ? "trending_up" : trend === "down" ? "trending_down" : "remove"}
            </span>
            {trendLabel}
          </span>
        )}
      </div>
      {subtitle && <p className="text-body-xs text-on-surface-variant">{subtitle}</p>}
    </div>
  );
}
