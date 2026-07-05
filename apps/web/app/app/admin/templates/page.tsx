"use client";

import { useEffect, useState } from "react";
import { createAdminService } from "@/core/admin";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createAdminService().listTemplates()
      .then((data) => setTemplates((data ?? []) as Record<string, unknown>[]))
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
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Workspace Templates ({templates.length})</h1>
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
        {templates.length === 0 && (
          <p className="col-span-full text-center font-mono text-[10px] text-on-surface-variant">No templates found.</p>
        )}
        {templates.map((t) => (
          <div key={t.id as string} className="rounded border border-outline-variant/30 bg-surface-container-low p-md">
            <div className="flex items-center justify-between">
              <p className="text-body-sm font-medium text-on-surface">{t.name as string}</p>
              {(t as { built_in?: boolean }).built_in && (
                <span className="rounded bg-surface-container-high px-[4px] py-[1px] font-mono text-[8px] text-on-surface-variant">built-in</span>
              )}
            </div>
            {(t as { description?: string }).description && (
              <p className="mt-xs font-mono text-[9px] text-on-surface-variant">{t.description as string}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
