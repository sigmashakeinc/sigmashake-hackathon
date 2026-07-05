"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

function trapFocus(e: KeyboardEvent, container: HTMLElement) {
  const focusable = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last?.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first?.focus();
  }
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        trapFocus(e, dialogRef.current);
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    const prev = document.activeElement;
    dialogRef.current?.focus();
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          "border-outline-variant bg-surface-container-low p-xl max-w-lg min-w-[400px] rounded border shadow-lg",
          "focus-visible:outline-none",
          className,
        )}
      >
        {title && (
          <div className="mb-lg flex items-center justify-between">
            <h2 className="text-h2 text-on-surface font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Close dialog"
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
        {children}
      </div>
    </div>
  );
}
