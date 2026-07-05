"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/packages/utils";

type DrawerSide = "left" | "right";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: DrawerSide;
  width?: number;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  width = 360,
  className,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    panelRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{ width, [side]: 0 }}
        className={cn(
          "border-outline-variant bg-surface-container-low fixed top-0 bottom-0 z-50 flex flex-col border-l",
          "focus-visible:outline-none",
          "animate-in slide-in-from-right",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && (
          <div className="border-outline-variant/30 px-lg py-md flex items-center justify-between border-b">
            <h2 className="text-h2 text-on-surface font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Close drawer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-lg flex-1 scrollbar-thin overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
