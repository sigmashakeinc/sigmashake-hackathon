import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn(
        "mt-lg gap-sm border-outline-variant/30 pt-lg flex items-center justify-end border-t",
        className,
      )}
    >
      {children}
    </div>
  );
}
