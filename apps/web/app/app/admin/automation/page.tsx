"use client";

import { useEffect, useState } from "react";
import { getSupabaseServerClient } from "@/services/supabase";
import { createAdminService, type AdminDashboard } from "@/core/admin";
import { AdminCard } from "@/components/admin/admin-card";
import { RunHistory } from "@/components/automation/run-history";
import type { AutomationRun } from "@/core/automation";

export default function AdminAutomationPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [recentRuns, setRecentRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      createAdminService().getDashboard(),
      getSupabaseServerClient()
        .from("automation_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ])
      .then(([d, r]) => {
        setDashboard(d);
        setRecentRuns((r.data ?? []) as unknown as AutomationRun[]);
      })
      .catch((err) => console.error("[Page] error:", err))
      .finally(() => setLoading(false));
  }, []);

  const failed = dashboard?.automationFailed ?? 0;

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
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Automation Engine</h1>

      <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-4">
        <AdminCard label="Rules" value={dashboard?.automationRules ?? 0} icon="auto_awesome" />
        <AdminCard label="Total Runs" value={dashboard?.automationRunCount ?? 0} icon="play_arrow" />
        <AdminCard label="Failed Runs" value={failed} icon="error" color={failed > 0 ? "text-error" : "text-[#3fb950]"} />
        <AdminCard label="Disabled Rules" value={dashboard?.automationDisabled ?? 0} icon="toggle_off" />
      </div>

      <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
        <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Recent Runs</h2>
        <RunHistory runs={recentRuns} />
      </div>
    </div>
  );
}
