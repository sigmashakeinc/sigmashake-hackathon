import type { ReactNode } from "react";
import { cn } from "@/packages/utils";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div
        className={cn(
          "border-outline-variant bg-surface p-xl w-full max-w-[400px] rounded border",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
