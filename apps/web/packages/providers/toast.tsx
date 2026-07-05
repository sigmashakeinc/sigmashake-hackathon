"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/packages/utils";

type ToastVariant = "info" | "success" | "warning" | "error";

interface Toast {
  id: string;
  message: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

const variantStyles: Record<ToastVariant, string> = {
  info: "border-primary/40 bg-primary/5",
  success: "border-[#3fb950]/40 bg-[#3fb950]/5",
  warning: "border-[#d29922]/40 bg-[#d29922]/5",
  error: "border-error-container/40 bg-error-container/5",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
        className="bottom-xl right-xl gap-sm pointer-events-none fixed z-[60] flex flex-col"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "gap-md px-lg py-sm text-body-sm pointer-events-auto flex items-center rounded border shadow-lg transition-all",
              variantStyles[toast.variant ?? "info"],
              "bg-surface-container-low text-on-surface",
            )}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Dismiss"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
