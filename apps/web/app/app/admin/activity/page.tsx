"use client";

import { useEffect, useState } from "react";
import { createActivityService, type ActivityEvent, MODULE_LABELS, MODULE_ICONS } from "@/core/activity";

export default function AdminActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [errors, setErrors] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const svc = createActivityService();
    svc.list("", 50)
      .then((all) => {
        setEvents(all);
        setErrors(all.filter((e) => e.severity === "error"));
      })
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
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Activity</h1>

      {errors.length > 0 && (
        <div className="mb-lg rounded border border-error/30 bg-error/5 p-md">
          <h2 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-error">Recent Errors ({errors.length})</h2>
          <div className="flex flex-col gap-xs">
            {errors.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded bg-surface-container px-sm py-xs">
                <span className="text-body-sm text-on-surface">{e.title}</span>
                <span className="font-mono text-[8px] text-on-surface-variant/50">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
        <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Recent Activity</h2>
        {events.length === 0 ? (
          <p className="font-mono text-[10px] text-on-surface-variant">No activity recorded.</p>
        ) : (
          <div className="flex flex-col gap-xs">
            {events.slice(0, 30).map((e) => (
              <div key={e.id} className="flex items-start gap-sm rounded bg-surface-container px-sm py-xs">
                <span className="material-symbols-outlined mt-[1px] text-[14px] text-on-surface-variant/40">
                  {MODULE_ICONS[e.module] ?? "circle"}
                </span>
                <div className="flex-1">
                  <p className="text-body-sm text-on-surface">{e.title}</p>
                  <div className="flex items-center gap-sm">
                    <span className="font-mono text-[8px] text-on-surface-variant/50">{MODULE_LABELS[e.module] ?? e.module}</span>
                    <span className={`font-mono text-[8px] ${e.severity === "error" ? "text-error" : e.severity === "warning" ? "text-[#d29922]" : "text-on-surface-variant/50"}`}>
                      {e.severity}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[8px] text-on-surface-variant/50">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
