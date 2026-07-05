"use client";

import { useState, useRef, useEffect } from "react";

interface ReviewRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reviewerId: string, message?: string) => Promise<void>;
  moduleLabel: string;
}

export function ReviewRequestDialog({ open, onClose, onSubmit, moduleLabel }: ReviewRequestDialogProps) {
  const [reviewerId, setReviewerId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  async function handleSubmit() {
    if (!reviewerId.trim()) return;
    setSubmitting(true);
    await onSubmit(reviewerId.trim(), message.trim() || undefined);
    setSubmitting(false);
    setReviewerId("");
    setMessage("");
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true" aria-label="Request review">
      <div ref={ref} className="w-full max-w-sm rounded-lg border border-outline-variant bg-surface-container p-lg">
        <h2 className="mb-sm text-h3 font-semibold text-on-surface">Request Review</h2>
        <p className="mb-md font-mono text-[10px] text-on-surface-variant">for {moduleLabel}</p>

        <div className="flex flex-col gap-sm">
          <div className="flex flex-col gap-[4px]">
            <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Reviewer User ID</label>
            <input
              type="text"
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              placeholder="Enter reviewer user ID"
              className="h-8 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              aria-label="Reviewer ID"
            />
          </div>
          <div className="flex flex-col gap-[4px]">
            <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like reviewed?"
              rows={3}
              className="rounded border border-outline-variant/30 bg-black px-sm py-xs text-body-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-none"
              aria-label="Message"
            />
          </div>
          <div className="mt-sm flex justify-end gap-sm">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded border border-outline-variant/30 px-md py-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={!reviewerId.trim() || submitting} className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:pointer-events-none disabled:opacity-50">
              {submitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
