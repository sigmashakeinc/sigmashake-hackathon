import type { ReactNode } from "react";
import { cn } from "@/packages/utils";

interface EmptyLayoutProps {
  children: ReactNode;
  className?: string;
}

export function EmptyLayout({ children, className }: EmptyLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-screen w-screen items-center justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
