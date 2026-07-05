"use client";

import { cn } from "@/lib/utils";

interface HealthIndicatorProps {
  status: "healthy" | "warning" | "error" | "unknown";
  label: string;
  sub?: string;
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  healthy: "bg-[#3fb950]",
  warning: "bg-[#d29922]",
  error: "bg-[#f85149]",
  unknown: "bg-on-surface-variant/40",
};

const pulseMap = {
  healthy: "",
  warning: "animate-pulse",
  error: "animate-pulse",
  unknown: "",
};

export function HealthIndicator({ status, label, sub, size = "md" }: HealthIndicatorProps) {
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : size === "lg" ? "h-3 w-3" : "h-2 w-2";
  return (
    <div className="flex items-center gap-sm">
      <span className={cn("inline-block shrink-0 rounded-full", dotSize, colorMap[status], pulseMap[status])} />
      <div>
        <p className={cn("font-medium text-on-surface", size === "sm" && "text-body-xs")}>{label}</p>
        {sub && <p className="font-mono text-[9px] text-on-surface-variant">{sub}</p>}
      </div>
    </div>
  );
}
