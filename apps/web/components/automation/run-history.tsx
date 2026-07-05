"use client";

import type { AutomationRun } from "@/core/automation";

interface RunHistoryProps {
  runs: AutomationRun[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RunHistory({ runs }: RunHistoryProps) {
  return (
    <div className="flex flex-col gap-xs">
      {runs.length === 0 ? (
        <p className="py-md text-center font-mono text-[10px] text-on-surface-variant">No runs yet.</p>
      ) : runs.slice(0, 20).map((r) => (
        <div key={r.id} className="flex items-center gap-sm rounded border border-outline-variant/10 bg-surface-container-lowest px-sm py-xs font-mono text-[9px]">
          <span className={`material-symbols-outlined text-[12px] ${
            r.status === "completed" ? "text-[#3fb950]" : r.status === "failed" ? "text-error" : r.status === "running" ? "text-primary" : "text-on-surface-variant"
          }`}>
            {r.status === "completed" ? "check_circle" : r.status === "failed" ? "error" : r.status === "running" ? "hourglass_top" : "circle"}
          </span>
          <span className="text-on-surface-variant">{r.triggerType} → {r.actionType}</span>
          <span className="ml-auto text-on-surface-variant">
            {timeAgo(r.createdAt)}
            {r.durationMs != null && ` (${r.durationMs}ms)`}
          </span>
          {r.errorMessage && <span className="text-error truncate max-w-[200px]">{r.errorMessage}</span>}
        </div>
      ))}
    </div>
  );
}
