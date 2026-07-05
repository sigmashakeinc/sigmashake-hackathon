"use client";

import { useEffect, useState } from "react";
import { createAdminService, type AdminDashboard } from "@/core/admin";
import { AdminCard } from "@/components/admin/admin-card";

export default function AdminIntegrationsPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createAdminService().getDashboard()
      .then((d) => setDashboard(d))
      .catch((err) => console.error("[Page] error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-sm">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Integrations</h1>

      <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-3">
        <AdminCard label="Total" value={dashboard?.connectedIntegrations ?? 0} icon="extension" />
        <AdminCard label="Errors" value={dashboard?.integrationErrors ?? 0} icon="error" color={dashboard?.integrationErrors ? "text-error" : "text-[#3fb950]"} />
        <AdminCard label="Health Score" value={(dashboard?.connectedIntegrations ?? 0) > 0 ? "—" : "N/A"} icon="monitor_heart" />
      </div>

      <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
        <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Connection Status</h2>
        <p className="font-mono text-[10px] text-on-surface-variant">{dashboard?.connectedIntegrations ?? 0} integration(s) registered.</p>
      </div>
    </div>
  );
}
