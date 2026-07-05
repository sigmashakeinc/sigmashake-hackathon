"use client";

import { useEffect, useState } from "react";
import { createAdminService, type AdminDashboard } from "@/core/admin";
import { AdminCard } from "@/components/admin/admin-card";
import { HealthIndicator } from "@/components/admin/health-indicator";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createAdminService().getDashboard()
      .then(setData)
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
    <div className="overflow-y-auto p-lg scrollbar-thin">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-lg flex items-center gap-sm">
          <span className="material-symbols-outlined text-[20px] text-primary">admin_panel_settings</span>
          <h1 className="text-h1 font-semibold text-on-surface">Owner Control Centre</h1>
        </div>

        {/* Platform Health Banner */}
        <div className="mb-lg flex items-center gap-md rounded border border-outline-variant/30 bg-surface-container-low p-md">
          <HealthIndicator status={data?.platformHealth ?? "unknown"} label="Platform Health" sub={`v${data?.platformVersion ?? "—"} · ${data?.deploymentEnvironment ?? "—"}`} size="lg" />
          <div className="ml-auto flex items-center gap-md">
            <span className="font-mono text-[10px] text-on-surface-variant">{data?.totalHackathons ?? 0} hackathons</span>
            <span className="font-mono text-[10px] text-on-surface-variant">{data?.totalMembers ?? 0} members</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
          <AdminCard label="Active Workspace" value={data?.activeHackathon ?? "None"} icon="workspaces" sub={data?.activeHackathonId ?? ""} />
          <AdminCard label="Connected Integrations" value={data?.connectedIntegrations ?? 0} icon="extension"
            sub={data?.integrationErrors ? `${data.integrationErrors} error(s)` : "All healthy"}
            color={data?.integrationErrors ? "text-error" : "text-[#3fb950]"} />
          <AdminCard label="Automation" value={`${data?.automationRules ?? 0}`} icon="auto_awesome"
            sub="registered rules" />
          <AdminCard label="Storage" value={data?.storageUsed ?? "—"} icon="cloud"
            sub={`${data?.storagePct ?? 0}% used`} />
        </div>

        <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
          <AdminCard label="Database" value={data?.databaseStatus === "healthy" ? "Healthy" : "Error"} icon="storage"
            sub={data?.databaseSize} color={data?.databaseStatus === "healthy" ? "text-[#3fb950]" : "text-error"} />
          <AdminCard label="Recent Errors" value={data?.recentErrors ?? 0} icon="bug_report"
            color={data?.recentErrors ? "text-error" : "text-[#3fb950]"} />
          <AdminCard label="Total Hackathons" value={data?.totalHackathons ?? 0} icon="emoji_events" />
        </div>

        {/* Quick Links */}
        <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
          <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-4">
            <Link href="/app/admin/members" className="flex items-center gap-sm rounded bg-surface-container px-sm py-xs text-body-sm text-on-surface transition-colors hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[14px]">group</span> Members
            </Link>
            <Link href="/app/admin/maintenance" className="flex items-center gap-sm rounded bg-surface-container px-sm py-xs text-body-sm text-on-surface transition-colors hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[14px]">build</span> Maintenance
            </Link>
            <Link href="/app/admin/diagnostics" className="flex items-center gap-sm rounded bg-surface-container px-sm py-xs text-body-sm text-on-surface transition-colors hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[14px]">monitor_heart</span> Diagnostics
            </Link>
            <Link href="/app/admin/activity" className="flex items-center gap-sm rounded bg-surface-container px-sm py-xs text-body-sm text-on-surface transition-colors hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[14px]">article</span> Logs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
