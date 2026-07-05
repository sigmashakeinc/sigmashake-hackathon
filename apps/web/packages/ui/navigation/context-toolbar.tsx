import type { ReactNode } from "react";
import { cn } from "@/packages/utils";

interface ToolbarAction {
  label: string;
  icon?: string;
  onClick: () => void;
  active?: boolean;
}

interface ContextToolbarProps {
  actions: ToolbarAction[];
  className?: string;
  children?: ReactNode;
}

export function ContextToolbar({
  actions,
  className,
  children,
}: ContextToolbarProps) {
  return (
    <div
      className={cn(
        "gap-gutter bg-surface-container p-xs flex items-center rounded",
        className,
      )}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={cn(
            "gap-xs px-sm py-xs text-body-sm inline-flex items-center rounded transition-colors",
            action.active
              ? "bg-secondary-container text-on-surface"
              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
          )}
        >
          {action.icon && (
            <span className="material-symbols-outlined text-[14px]">
              {action.icon}
            </span>
          )}
          {action.label}
        </button>
      ))}
      {children}
    </div>
  );
}
