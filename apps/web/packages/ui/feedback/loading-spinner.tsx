import { cn } from "@/packages/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-[2px]",
  md: "h-6 w-6 border-[2px]",
  lg: "h-8 w-8 border-[3px]",
};

export function LoadingSpinner({
  size = "md",
  className,
  label,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn("gap-sm inline-flex items-center", className)}
      role="status"
      aria-label={label ?? "Loading"}
    >
      <div
        className={cn(
          "border-surface-container-high border-t-primary animate-spin rounded-full",
          sizeMap[size],
        )}
      />
      {label && (
        <span className="text-body-sm text-on-surface-variant">{label}</span>
      )}
    </div>
  );
}
