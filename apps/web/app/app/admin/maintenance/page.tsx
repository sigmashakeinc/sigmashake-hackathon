"use client";

import { useAuth } from "@/identity";
import { createAdminService } from "@/core/admin";
import { MaintenanceButton } from "@/components/admin/maintenance-button";

export default function AdminMaintenancePage() {
  const { user } = useAuth();
  const svc = createAdminService();

  const tasks = [
    { label: "Rebuild Search Index", description: "Re-indexes all searchable content across the platform.", confirm: true, run: () => svc.rebuildSearchIndex(user!.id) },
    { label: "Recalculate Analytics", description: "Forces analytics recalculation for all workspaces.", confirm: true, run: () => svc.recalculateAnalytics(user!.id) },
    { label: "Validate Relationships", description: "Checks for broken relationships and references.", confirm: true, run: () => svc.validateRelationships(user!.id) },
    { label: "Clean Orphaned Records", description: "Removes records with no valid hackathon reference.", confirm: true, run: () => svc.cleanOrphanedRecords(user!.id) },
    { label: "Verify Storage", description: "Checks all storage buckets are accessible.", confirm: false, run: () => svc.verifyStorage(user!.id) },
    { label: "Refresh Cache", description: "Clears and refreshes cached data.", confirm: false, run: () => svc.refreshCache(user!.id) },
    { label: "Run Health Checks", description: "Executes full platform diagnostics.", confirm: false, run: () => svc.runHealthChecks(user!.id) },
  ];

  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Maintenance</h1>
      <div className="flex flex-col gap-sm">
        {tasks.map((t) => (
          <MaintenanceButton key={t.label} label={t.label} description={t.description}
            onRun={t.run} confirmMessage={t.confirm ? "Confirm" : undefined} />
        ))}
      </div>
    </div>
  );
}
