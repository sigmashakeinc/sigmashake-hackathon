"use client";

import type { IntegrationLog, IntegrationValidation } from "@/core/integrations";

interface SyncHistoryProps {
  logs: IntegrationLog[];
  validations: IntegrationValidation[];
}

export function SyncHistory({ logs, validations }: SyncHistoryProps) {
  const all = [
    ...logs.map((l) => ({ ...l, _type: "log" as const })),
    ...validations.map((v) => ({ ...v, _type: "validation" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-md">
      <h3 className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
        Activity ({all.length})
      </h3>

      {all.length === 0 ? (
        <p className="font-mono text-[10px] text-on-surface-variant">No activity recorded.</p>
      ) : (
        <div className="flex max-h-48 flex-col gap-[2px] overflow-y-auto scrollbar-thin">
          {all.slice(0, 30).map((entry) => (
            <div key={entry.id} className="flex items-start gap-xs rounded px-sm py-[2px] font-mono text-[9px]">
              {"level" in entry && entry._type === "log" ? (
                <>
                  <span className={`material-symbols-outlined text-[12px] mt-[1px] ${
                    entry.level === "error" ? "text-error" : entry.level === "warning" ? "text-[#d29922]" : "text-on-surface-variant"
                  }`}>
                    {entry.level === "error" ? "error" : entry.level === "warning" ? "warning" : "info"}
                  </span>
                  <span className="text-on-surface-variant shrink-0">{new Date(entry.createdAt).toLocaleTimeString()}</span>
                  <span className="text-on-surface truncate">{entry.message}</span>
                </>
              ) : (
                <>
                  <span className={`material-symbols-outlined text-[12px] mt-[1px] ${
                    (entry as IntegrationValidation).result === "passed" ? "text-[#3fb950]" : (entry as IntegrationValidation).result === "failed" ? "text-error" : "text-[#d29922]"
                  }`}>
                    {(entry as IntegrationValidation).result === "passed" ? "check" : (entry as IntegrationValidation).result === "failed" ? "close" : "warning"}
                  </span>
                  <span className="text-on-surface-variant shrink-0">{new Date(entry.createdAt).toLocaleTimeString()}</span>
                  <span className="text-on-surface truncate">{(entry as IntegrationValidation).validationType}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
