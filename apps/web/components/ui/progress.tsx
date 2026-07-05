import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: "sm" | "md";
  variant?: "default" | "primary";
  showLabel?: boolean;
  label?: string;
}

export function Progress({
  value,
  max = 100,
  className,
  size = "sm",
  variant = "default",
  showLabel = false,
  label,
}: ProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("flex flex-col gap-[2px]", className)}>
      {showLabel && (
        <div className="text-on-surface-variant flex justify-between font-mono text-[10px]">
          <span>{label ?? "Progress"}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? "Progress"}
        className={cn(
          "bg-surface-container-highest w-full overflow-hidden rounded-full",
          size === "sm" ? "h-1" : "h-1.5",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            variant === "primary" ? "bg-primary" : "bg-on-surface",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
