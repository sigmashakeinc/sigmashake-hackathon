"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/identity";
import { getSupabaseBrowserClient } from "@/services/supabase";

export default function SecuritySettingsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<{ id: string; createdAt: string }[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getSupabaseBrowserClient().auth.getSession().then(({ data }: { data: { session: { access_token?: string | null; expires_at?: number | null } | null } | null }) => {
      if (data?.session) {
        const token = data.session.access_token;
        const id = token ? token.slice(-8) : "—";
        setSessions([{ id, createdAt: new Date(data.session.expires_at ?? 0).toISOString() }]);
      }
    }).catch((err: unknown) => console.error("[Page] error:", err));
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Security</h1>
      <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
        <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Active Session</h2>
        {sessions.length === 0 ? (
          <p className="font-mono text-[10px] text-on-surface-variant">No active session found.</p>
        ) : (
          <div className="flex items-center justify-between rounded border border-outline-variant/30 bg-surface-container-low px-md py-sm">
            <div>
              <p className="text-body-sm text-on-surface">Current Session</p>
              <p className="font-mono text-[10px] text-on-surface-variant">ID: ...{sessions[0]!.id}</p>
            </div>
            <span className="inline-block h-2 w-2 rounded-full bg-[#3fb950]" title="Active" />
          </div>
        )}
      </div>
    </div>
  );
}
