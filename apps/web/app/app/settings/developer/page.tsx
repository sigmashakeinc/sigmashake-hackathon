"use client";

import { config } from "@/services/config";

export default function DeveloperSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Developer</h1>

      <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
        <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Application Info</h2>
        <div className="flex flex-col gap-xs font-mono text-[10px] text-on-surface-variant">
          <div className="flex justify-between"><span>Version</span><span className="text-on-surface">{config.app.version}</span></div>
          <div className="flex justify-between"><span>Environment</span><span className="text-on-surface">{config.app.environment}</span></div>
          <div className="flex justify-between"><span>Name</span><span className="text-on-surface">{config.app.name}</span></div>
          <div className="flex justify-between"><span>URL</span><span className="text-on-surface">{config.app.url}</span></div>
          <div className="flex justify-between"><span>Accounts</span><span className="text-on-surface">{config.accounts.url}</span></div>
          <div className="flex justify-between"><span>Cloudflare API</span><span className="text-on-surface">{config.cloudflare.apiUrl ? "Configured" : "Preview facade"}</span></div>
        </div>
      </div>

      <div className="mt-lg rounded border border-outline-variant/30 bg-surface-container p-lg">
        <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Data Plane</h2>
        <p className="font-mono text-[10px] text-on-surface-variant">Cloudflare D1/R2/KV adapters · local preview facade enabled</p>
      </div>
    </div>
  );
}
