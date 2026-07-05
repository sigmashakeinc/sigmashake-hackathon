"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createAdminService } from "@/core/admin";
import { AdminCard } from "@/components/admin/admin-card";

export default function AdminWorkspacePage() {
  const [dashboard, setDashboard] = useState<{ activeHackathon: string | null; activeHackathonId: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createAdminService().getDashboard()
      .then(setDashboard)
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
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Active Workspace</h1>

      {!dashboard?.activeHackathon ? (
        <p className="font-mono text-[10px] text-on-surface-variant">No active workspace.</p>
      ) : (
        <>
          <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-2">
            <AdminCard label="Current Hackathon" value={dashboard.activeHackathon} icon="emoji_events" />
            <AdminCard label="Status" value="Active" icon="check_circle" color="text-[#3fb950]" />
          </div>

          <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
            <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Quick Actions</h2>
            <div className="flex flex-col gap-sm">
              <Link href={`/app/planning`}
                className="flex items-center gap-sm rounded bg-surface-container px-md py-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-high">
                <span className="material-symbols-outlined text-[16px]">map</span>
                Open Planning
              </Link>
              <Link href={`/app/submission-prep`}
                className="flex items-center gap-sm rounded bg-surface-container px-md py-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-high">
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                Submission Prep
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
