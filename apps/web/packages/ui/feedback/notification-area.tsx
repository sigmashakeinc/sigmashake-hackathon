import { cn } from "@/packages/utils";

interface NotificationItem {
  id: string;
  message: string;
  timestamp: string;
  variant?: "info" | "warning" | "error" | "success";
}

interface NotificationAreaProps {
  notifications: NotificationItem[];
  className?: string;
  onDismiss?: (id: string) => void;
}

const dotColors: Record<string, string> = {
  info: "bg-primary",
  success: "bg-[#3fb950]",
  warning: "bg-[#d29922]",
  error: "bg-error",
};

export function NotificationArea({
  notifications,
  className,
  onDismiss,
}: NotificationAreaProps) {
  if (notifications.length === 0) return null;

  return (
    <div className={cn("gap-xs flex flex-col", className)}>
      {notifications.map((n) => (
        <div
          key={n.id}
          className="gap-sm border-outline-variant/30 bg-surface-container-low p-sm flex items-start rounded border"
        >
          <span
            className={cn(
              "mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full",
              dotColors[n.variant ?? "info"],
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-body-sm text-on-surface">{n.message}</p>
            <p className="text-on-surface-variant font-mono text-[10px]">
              {n.timestamp}
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(n.id)}
              className="text-on-surface-variant hover:text-on-surface shrink-0 transition-colors"
              aria-label="Dismiss"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M2 2l6 6M8 2l-6 6" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
