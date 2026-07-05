import { cn } from "@/lib/utils";

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-xl", className)}>
      <div className="flex items-center gap-sm">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-xs">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded border border-outline-variant/30 bg-surface-container-low" />
      ))}
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="flex gap-sm overflow-x-auto p-lg">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex w-72 shrink-0 flex-col gap-sm rounded border border-outline-variant/30 bg-surface-container-lowest p-sm">
          <div className="h-6 w-24 animate-pulse rounded bg-surface-container-high" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="h-20 animate-pulse rounded bg-surface-container-high" />
          ))}
        </div>
      ))}
    </div>
  );
}
