import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  children?: ReactNode;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
  children,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "gap-sm border-error-container/30 bg-error-container/5 p-xl flex flex-col items-center justify-center rounded border text-center",
        className,
      )}
    >
      <div className="gap-xs flex flex-col">
        <p className="text-body-sm text-error font-medium">{title}</p>
        <p className="text-body-sm text-on-surface-variant">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
      {children}
    </div>
  );
}
