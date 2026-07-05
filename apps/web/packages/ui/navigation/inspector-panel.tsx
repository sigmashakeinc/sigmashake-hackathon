import type { ReactNode } from "react";
import { cn } from "@/packages/utils";

interface InspectorPanelProps {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function InspectorPanel({
  title,
  children,
  actions,
  className,
}: InspectorPanelProps) {
  return (
    <aside
      className={cn("bg-surface-container-low flex h-full flex-col", className)}
    >
      {title && (
        <div className="border-outline-variant/30 px-lg py-md flex items-center justify-between border-b">
          <h3 className="text-on-surface-variant font-mono text-[10px] font-bold tracking-widest uppercase">
            {title}
          </h3>
          {actions && <div className="gap-sm flex items-center">{actions}</div>}
        </div>
      )}
      <div className="p-lg flex-1 scrollbar-thin overflow-y-auto">
        {children}
      </div>
    </aside>
  );
}

export function InspectorSection({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-lg", className)}>
      <p className="mb-sm text-on-surface-variant font-mono text-[10px] font-bold tracking-wider uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

export function InspectorField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("py-xs flex items-center justify-between", className)}>
      <span className="text-body-sm text-on-surface-variant">{label}</span>
      <span className="text-on-surface font-mono text-[11px]">{value}</span>
    </div>
  );
}
