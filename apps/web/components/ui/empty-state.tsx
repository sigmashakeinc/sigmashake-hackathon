import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "gap-sm border-outline-variant/30 p-xl flex flex-col items-center justify-center rounded border border-dashed text-center",
        className,
      )}
    >
      {icon && <div className="text-on-surface-variant/50">{icon}</div>}
      <div>
        <p className="text-body-sm text-on-surface font-medium">{title}</p>
        {description && (
          <p className="mt-xs text-body-sm text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-sm">{action}</div>}
    </div>
  );
}
