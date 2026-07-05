"use client";

import Link from "next/link";
import type { IntegrationConnection, IntegrationDefinition } from "@/core/integrations";

interface IntegrationCardProps {
  definition: IntegrationDefinition;
  connection: IntegrationConnection | null;
  href: string;
}

const STATUS_LABELS: Record<string, string> = {
  connected: "Connected",
  disconnected: "Disconnected",
  connecting: "Connecting",
  error: "Error",
};

export function IntegrationCard({ definition, connection, href }: IntegrationCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-sm rounded-lg border border-outline-variant/30 bg-surface-container-low p-md transition-all duration-150 hover:border-outline-variant/60 hover:shadow-sm"
      aria-label={`${definition.label} integration`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
            <span className="material-symbols-outlined text-[20px] text-primary">{definition.icon}</span>
          </div>
          <div>
            <h3 className="text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
              {definition.label}
            </h3>
            <p className="font-mono text-[9px] text-on-surface-variant">
              {connection ? STATUS_LABELS[connection.status] ?? connection.status : "Not configured"}
            </p>
          </div>
        </div>
        {connection && (
          <div className="flex items-center gap-xs">
            <span className={`h-2 w-2 rounded-full ${connection.status === "connected" ? "bg-[#3fb950]" : connection.status === "error" ? "bg-error" : "bg-surface-variant"}`} />
            {connection.healthScore > 0 && (
              <span className="font-mono text-[9px] text-on-surface-variant">{connection.healthScore}</span>
            )}
          </div>
        )}
      </div>

      {connection && (
        <div className="flex items-center gap-md font-mono text-[9px] text-on-surface-variant">
          <span>{connection.authMethod === "oauth" ? "OAuth" : connection.authMethod === "pat" ? "PAT" : connection.authMethod}</span>
          {connection.lastSyncedAt && <span>Synced {timeAgo(connection.lastSyncedAt)}</span>}
        </div>
      )}

      <p className="text-body-xs text-on-surface-variant line-clamp-2">
        {definition.description}
      </p>
    </Link>
  );
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
