import { cn } from "@/packages/utils";

const colorMap = {
  active: "bg-primary",
  idle: "bg-on-surface",
  paused: "bg-surface-variant",
  error: "bg-error",
  archived: "bg-tertiary-container",
  success: "bg-[#3fb950]",
  warning: "bg-[#d29922]",
};

interface StatusIndicatorProps {
  status: keyof typeof colorMap;
  label?: string;
  pulse?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  pulse = false,
  className,
}: StatusIndicatorProps) {
  return (
    <span className={cn("gap-xs inline-flex items-center", className)}>
      <span
        className={cn(
          "inline-block h-[6px] w-[6px] rounded-full",
          colorMap[status],
          pulse && "animate-pulse",
        )}
        aria-hidden="true"
      />
      {label && (
        <span className="text-on-surface-variant font-mono text-[10px]">
          {label}
        </span>
      )}
    </span>
  );
}
