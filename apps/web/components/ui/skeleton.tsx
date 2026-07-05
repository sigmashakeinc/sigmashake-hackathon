import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-high animate-pulse",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 w-full rounded",
        variant === "rectangular" && "rounded",
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="border-outline-variant/30 bg-surface-container p-md rounded border">
      <Skeleton className="mb-sm h-4 w-3/4" />
      <Skeleton className="mb-xs h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
