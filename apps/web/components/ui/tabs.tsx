import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { value: string; label: string; icon?: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "gap-gutter bg-surface-container p-xs inline-flex items-center rounded",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "gap-xs px-sm py-xs text-body-sm inline-flex items-center rounded transition-colors duration-150",
            value === tab.value
              ? "bg-secondary-container text-on-surface"
              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface TabContentProps {
  value: string;
  activeValue: string;
  children: ReactNode;
  className?: string;
}

export function TabContent({
  value,
  activeValue,
  children,
  className,
}: TabContentProps) {
  if (value !== activeValue) return null;
  return <div className={cn("pt-md", className)}>{children}</div>;
}
