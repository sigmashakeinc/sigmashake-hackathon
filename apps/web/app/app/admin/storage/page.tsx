"use client";

import { useEffect, useState } from "react";
import { createAdminService, type StorageOverview } from "@/core/admin";
import { AdminCard } from "@/components/admin/admin-card";

export default function AdminStoragePage() {
  const [storage, setStorage] = useState<StorageOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createAdminService().getStorageOverview()
      .then(setStorage)
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

  const sizeMB = (storage?.totalSize ?? 0) / (1024 * 1024);
  const sizeDisplay = sizeMB >= 1024 ? `${(sizeMB / 1024).toFixed(1)} GB` : `${sizeMB.toFixed(0)} MB`;

  return (
    <div className="p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Storage</h1>

      <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-3">
        <AdminCard label="Total Size" value={sizeDisplay} icon="cloud" />
        <AdminCard label="Total Files" value={storage?.totalFiles ?? 0} icon="description" />
        <AdminCard label="Orphaned" value={storage?.orphanedCount ?? 0} icon="link_off" color="text-[#d29922]" />
      </div>

      {storage && storage.bucketUsage.length > 0 && (
        <div className="mb-lg rounded border border-outline-variant/30 bg-surface-container-low p-lg">
          <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Bucket Usage</h2>
          <div className="flex flex-col gap-xs">
            {storage.bucketUsage.map((b) => {
              const pct = storage.totalSize > 0 ? Math.round((b.size / storage.totalSize) * 100) : 0;
              return (
                <div key={b.bucket} className="flex items-center gap-sm">
                  <span className="w-32 font-mono text-[9px] text-on-surface-variant">{b.bucket}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-surface-container-high">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="w-16 text-right font-mono text-[9px] text-on-surface-variant">{b.count} files</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {storage && storage.largestFiles.length > 0 && (
        <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
          <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Largest Files</h2>
          <div className="flex flex-col gap-xs">
            {storage.largestFiles.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded bg-surface-container px-sm py-xs">
                <p className="text-body-sm text-on-surface">{f.name}</p>
                <span className="font-mono text-[9px] text-on-surface-variant">
                  {f.size >= 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
