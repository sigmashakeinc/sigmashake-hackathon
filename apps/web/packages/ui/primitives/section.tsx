import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/packages/utils";

interface SectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: ReactNode;
}

export function Section({
  title,
  actions,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("flex flex-col", className)} {...props}>
      {title && (
        <div className="border-outline-variant/30 pb-sm mb-md flex items-center justify-between border-b">
          <h3 className="text-on-surface-variant font-mono text-[10px] font-bold tracking-widest uppercase">
            {title}
          </h3>
          {actions && <div className="gap-sm flex items-center">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
