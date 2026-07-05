"use client";

import { useEffect, useState } from "react";
import { createAdminService, type DatabaseOverview } from "@/core/admin";
import { AdminCard } from "@/components/admin/admin-card";

export default function AdminDatabasePage() {
  const [db, setDb] = useState<DatabaseOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createAdminService().getDatabaseOverview()
      .then(setDb)
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
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Database</h1>

      <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard label="Migration" value={`v${db?.migrationVersion ?? "—"}`} icon="code" />
        <AdminCard label="Size" value={db?.databaseSize ?? "—"} icon="storage" />
        <AdminCard label="Indexes" value={db?.indexCount ?? 0} icon="sort" />
        <AdminCard label="Status" value={db?.healthy ? "Healthy" : "Error"} icon="check_circle" color={db?.healthy ? "text-[#3fb950]" : "text-error"} />
      </div>

      {db && (
        <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
          <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Table Counts</h2>
          <div className="grid grid-cols-2 gap-xs sm:grid-cols-3 lg:grid-cols-4">
            {db.tableCounts.map((t) => (
              <div key={t.table} className="flex items-center justify-between rounded bg-surface-container px-sm py-xs">
                <p className="font-mono text-[9px] text-on-surface-variant">{t.table}</p>
                <span className={`font-mono text-[9px] ${t.count === -1 ? "text-error" : "text-on-surface"}`}>
                  {t.count === -1 ? "ERR" : t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
