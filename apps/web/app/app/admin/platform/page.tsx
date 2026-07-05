"use client";

import { useEffect, useState } from "react";
import { createAdminService, type PlatformInfo } from "@/core/admin";
import { config } from "@/services/config";

export default function AdminPlatformPage() {
  const [info, setInfo] = useState<PlatformInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createAdminService().getPlatformInfo()
      .then(setInfo)
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

  if (!info) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-[10px] text-on-surface-variant">Platform configuration not found.</p>
      </div>
    );
  }

  const rows = [
    { label: "Platform Name", value: info.platformName },
    { label: "Owner", value: info.ownerName },
    { label: "Owner Email", value: info.ownerEmail },
    { label: "Platform Version", value: `v${info.version}` },
    { label: "Schema Version", value: "1" },
    { label: "Environment", value: config.app.environment },
    { label: "Deployment Date", value: new Date(info.deployedAt).toLocaleDateString() },
    { label: "Initialised", value: info.initialized ? "Yes" : "No" },
  ];

  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Platform</h1>
      <div className="rounded border border-outline-variant/30 bg-surface-container-low">
        {rows.map((r, i) => (
          <div key={r.label} className={`flex items-center justify-between px-lg py-md ${i < rows.length - 1 ? "border-b border-outline-variant/10" : ""}`}>
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{r.label}</p>
            <p className="text-body-sm text-on-surface">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
