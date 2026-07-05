"use client";

import { useState } from "react";

interface MaintenanceButtonProps {
  label: string;
  description: string;
  onRun: () => Promise<{ success: boolean; message: string }>;
  confirmMessage?: string;
}

export function MaintenanceButton({ label, description, onRun, confirmMessage }: MaintenanceButtonProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleRun() {
    if (confirmMessage && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    setShowConfirm(false);
    setRunning(true);
    setResult(null);
    try {
      const res = await onRun();
      setResult(res);
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : "Operation failed." });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="rounded border border-outline-variant/30 bg-surface-container-low p-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-body-sm font-medium text-on-surface">{label}</p>
          <p className="font-mono text-[9px] text-on-surface-variant">{description}</p>
        </div>
        <button type="button" onClick={handleRun} disabled={running}
          className="shrink-0 rounded bg-primary px-sm py-xs text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:opacity-50">
          {running ? "Running..." : showConfirm ? "Click to Confirm" : "Run"}
        </button>
      </div>
      {result && (
        <p className={`mt-xs font-mono text-[9px] ${result.success ? "text-[#3fb950]" : "text-error"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
