"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className="mb-xs bg-surface-container-highest px-sm py-xs text-on-surface absolute bottom-full left-1/2 z-50 -translate-x-1/2 rounded font-mono text-[10px] whitespace-nowrap shadow-sm"
        >
          {content}
        </div>
      )}
    </div>
  );
}
