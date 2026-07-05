"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/packages/utils";

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}

export function Popover({
  trigger,
  children,
  className,
  align = "center",
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={cn(
            "mt-xs border-outline-variant bg-surface-container-low p-xs absolute top-full z-50 min-w-[180px] rounded border shadow-lg",
            align === "center" && "left-1/2 -translate-x-1/2",
            align === "start" && "left-0",
            align === "end" && "right-0",
            className,
          )}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function PopoverItem({
  label,
  onClick,
  shortcut,
  variant,
}: {
  label: string;
  onClick: () => void;
  shortcut?: string;
  variant?: "danger";
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "px-md py-sm text-body-sm flex w-full items-center justify-between rounded transition-colors",
        variant === "danger"
          ? "text-error hover:bg-error-container/20"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
      )}
    >
      <span>{label}</span>
      {shortcut && (
        <kbd className="ml-lg text-on-surface-variant font-mono text-[10px]">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
