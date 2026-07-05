import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("gap-xs flex items-center", className)}
    >
      <ol className="gap-xs flex items-center">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="gap-xs flex items-center">
              {index > 0 && (
                <span className="text-on-surface-variant/50" aria-hidden="true">
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="text-on-surface-variant hover:text-on-surface flex items-center gap-[2px] font-mono text-[10px] transition-colors"
                >
                  {item.icon}
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-[2px] font-mono text-[10px]",
                    isLast ? "text-on-surface" : "text-on-surface-variant",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
