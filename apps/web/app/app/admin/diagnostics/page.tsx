"use client";

import { useState } from "react";
import { createAdminService, type DiagnosticsReport } from "@/core/admin";
import { HealthIndicator } from "@/components/admin/health-indicator";

export default function AdminDiagnosticsPage() {
  const [report, setReport] = useState<DiagnosticsReport | null>(null);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    setReport(null);
    try {
      const result = await createAdminService().runDiagnostics();
      setReport(result);
    } catch {
      setReport(null);
    } finally {
      setRunning(false);
    }
  }

  const checks = report ? [
    report.database, report.storage, report.auth, report.github,
    report.automation, report.relationships, report.notifications,
    report.search, report.archive,
  ] : [];

  return (
    <div className="mx-auto max-w-2xl p-lg">
      <div className="mb-lg flex items-center justify-between">
        <h1 className="text-h1 font-semibold text-on-surface">Diagnostics</h1>
        <button type="button" onClick={handleRun} disabled={running}
          className="flex items-center gap-xs rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:opacity-50">
          <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
          {running ? "Running..." : "Run Diagnostics"}
        </button>
      </div>

      {!report && !running && (
        <p className="text-center font-mono text-[10px] text-on-surface-variant">
          Click &quot;Run Diagnostics&quot; to check platform health.
        </p>
      )}

      {running && (
        <div className="flex items-center justify-center gap-sm py-xl">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
        </div>
      )}

      {report && (
        <>
          <div className="mb-lg flex items-center gap-md rounded border border-outline-variant/30 bg-surface-container-low p-md">
            <HealthIndicator status={report.errors > 0 ? "error" : report.warnings > 0 ? "warning" : "healthy"} label="Platform Diagnostics" size="lg" />
            <span className="font-mono text-[10px] text-[#3fb950]">{report.healthy} healthy</span>
            {report.warnings > 0 && <span className="font-mono text-[10px] text-[#d29922]">{report.warnings} warnings</span>}
            {report.errors > 0 && <span className="font-mono text-[10px] text-error">{report.errors} errors</span>}
          </div>

          <div className="flex flex-col gap-xs">
            {checks.map((c) => (
              <div key={c.check} className="flex items-center justify-between rounded border border-outline-variant/30 bg-surface-container-low px-md py-sm">
                <div className="flex items-center gap-md">
                  <span className={`h-2 w-2 rounded-full ${
                    c.status === "healthy" ? "bg-[#3fb950]" : c.status === "warning" ? "bg-[#d29922]" : "bg-error"
                  }`} />
                  <div>
                    <p className="text-body-sm font-medium text-on-surface">{c.check}</p>
                    <p className="font-mono text-[9px] text-on-surface-variant">{c.message}</p>
                  </div>
                </div>
                <span className={`font-mono text-[9px] ${
                  c.status === "healthy" ? "text-[#3fb950]" : c.status === "warning" ? "text-[#d29922]" : "text-error"
                }`}>{c.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
