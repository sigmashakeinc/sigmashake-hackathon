"use client";

import { useRef, useEffect } from "react";
import type { ExportFormat } from "@/core/reports";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
}

export function ExportDialog({ open, onClose, onExport, isExporting }: ExportDialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusable = ref.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true" aria-label="Export report">
      <div ref={ref} className="w-full max-w-sm rounded-lg border border-outline-variant bg-surface-container p-lg">
        <h2 className="mb-md text-h3 font-semibold text-on-surface">Export Report</h2>

        <div className="flex flex-col gap-sm">
          {[
            { format: "json" as ExportFormat, label: "JSON", desc: "Full structured data" },
            { format: "csv" as ExportFormat, label: "CSV", desc: "Spreadsheet-compatible" },
          ].map((option) => (
            <button
              key={option.format}
              type="button"
              onClick={() => onExport(option.format)}
              disabled={isExporting}
              className="flex items-center gap-md rounded border border-outline-variant/30 bg-surface p-md text-left transition-colors hover:border-outline-variant/60 disabled:pointer-events-none disabled:opacity-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  {option.format === "json" ? "data_object" : "table"}
                </span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-body-sm font-medium text-on-surface">{option.label}</span>
                <span className="text-body-xs text-on-surface-variant">{option.desc}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-md flex justify-end gap-sm">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="rounded border border-outline-variant px-md py-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-higher disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>
          {isExporting && (
            <div className="flex items-center gap-xs rounded bg-primary px-md py-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span className="text-body-sm text-white">Exporting...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
