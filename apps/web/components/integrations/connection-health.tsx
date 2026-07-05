"use client";

import type { IntegrationConnection, IntegrationHealth, IntegrationValidation } from "@/core/integrations";

interface ConnectionHealthProps {
  connection: IntegrationConnection;
  health: IntegrationHealth | null;
  validations: IntegrationValidation[];
  details: { label: string; value: string }[];
}

const HEALTH_ICONS: Record<string, string> = {
  healthy: "check_circle",
  warning: "warning",
  error: "error",
  unknown: "help",
};

const HEALTH_COLORS: Record<string, string> = {
  healthy: "text-[#3fb950]",
  warning: "text-[#d29922]",
  error: "text-error",
  unknown: "text-on-surface-variant",
};

export function ConnectionHealth({ connection, health, validations, details }: ConnectionHealthProps) {
  return (
    <div className="flex flex-col gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-md">
      <h3 className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Connection Health</h3>

      {/* Status indicator */}
      <div className="flex items-center gap-sm">
        <span className={`material-symbols-outlined text-[20px] ${HEALTH_COLORS[health?.status ?? "unknown"]}`}>
          {HEALTH_ICONS[health?.status ?? "unknown"]}
        </span>
        <div>
          <p className="text-body-sm font-medium text-on-surface capitalize">{health?.status ?? "Unknown"}</p>
          <p className="font-mono text-[9px] text-on-surface-variant">
            Score: {health?.score ?? 0}/100
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-[2px] font-mono text-[10px] text-on-surface-variant">
        {details.map((d) => (
          <div key={d.label} className="flex justify-between">
            <span>{d.label}</span>
            <span className="text-on-surface">{d.value}</span>
          </div>
        ))}
        <div className="flex justify-between">
          <span>Connection</span>
          <span className={connection.status === "connected" ? "text-[#3fb950]" : "text-error"}>{connection.status}</span>
        </div>
        <div className="flex justify-between">
          <span>Auth</span>
          <span>{connection.authMethod === "oauth" ? "GitHub OAuth" : connection.authMethod === "pat" ? "PAT" : connection.authMethod}</span>
        </div>
        {connection.lastSyncedAt && (
          <div className="flex justify-between">
            <span>Last Sync</span>
            <span>{new Date(connection.lastSyncedAt).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Version</span>
          <span>{connection.version}</span>
        </div>
      </div>

      {/* Validation results */}
      {validations.length > 0 && (
        <div className="flex flex-col gap-[2px]">
          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Validation</p>
          {validations.slice(0, 5).map((v) => (
            <div key={v.id} className="flex items-center gap-xs font-mono text-[9px]">
              <span className={`material-symbols-outlined text-[12px] ${
                v.result === "passed" ? "text-[#3fb950]" : v.result === "failed" ? "text-error" : v.result === "warning" ? "text-[#d29922]" : "text-on-surface-variant"
              }`}>
                {v.result === "passed" ? "check" : v.result === "failed" ? "close" : v.result === "warning" ? "warning" : "help"}
              </span>
              <span className="text-on-surface-variant">{v.validationType}</span>
              {v.message && <span className="text-on-surface truncate">{v.message}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
