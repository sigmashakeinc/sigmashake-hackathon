"use client";

import { useState, useEffect, useCallback } from "react";
import { createArchiveService, type WorkspaceArchive, type ArchiveStatus, type ArchiveResult } from "@/core/archive";
import { ArchiveCard, ComparisonView, TimelineView, ArchiveStats } from "@/components/archive";

export default function ArchivePage() {
  const [archives, setArchives] = useState<WorkspaceArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "timeline">("grid");
  const [status, setStatus] = useState<ArchiveStatus | "all">("all");
  const [result, setResult] = useState<ArchiveResult | "all">("all");
  const [search, setSearch] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [stats, setStats] = useState<{ totalArchived: number; wins: number; placements: number; completedProjects: number; avgHealthScore: number; avgCompletionPct: number; avgSubmissionReadiness: number; totalLessons: number } | null>(null);

  const archiveService = createArchiveService();

  const load = useCallback(async () => {
    setLoading(true);
    const [data, s] = await Promise.all([
      archiveService.list({ status, result: result as ArchiveResult | "all" | undefined, search: search || undefined }),
      archiveService.stats(),
    ]);
    setArchives(data);
    setStats(s);
    setLoading(false);
  }, [status, result, search, archiveService]);

  useEffect(() => { load(); }, [load]);

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : [id]
    );
  }

  const compareArchives = compareIds.map((id) => archives.find((a) => a.id === id)).filter((a): a is WorkspaceArchive => a != null);
  const left = compareArchives[0];
  const right = compareArchives[1];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-lg p-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">Archive</h1>
          <p className="text-body-sm text-on-surface-variant">
            {stats ? `${stats.totalArchived} archived workspace${stats.totalArchived !== 1 ? "s" : ""}` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded ${view === "grid" ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
            aria-label="Grid view"
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
          </button>
          <button
            type="button"
            onClick={() => setView("timeline")}
            className={`flex h-8 w-8 items-center justify-center rounded ${view === "timeline" ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
            aria-label="Timeline view"
          >
            <span className="material-symbols-outlined text-[18px]">timeline</span>
          </button>
        </div>
      </div>

      {stats && <ArchiveStats stats={stats} />}

      <div className="flex flex-wrap items-center gap-sm">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ArchiveStatus | "all")}
          className="h-8 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface focus:border-primary focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="abandoned">Abandoned</option>
          <option value="imported">Imported</option>
        </select>
        <select
          value={result}
          onChange={(e) => setResult(e.target.value as ArchiveResult | "all")}
          className="h-8 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface focus:border-primary focus:outline-none"
          aria-label="Filter by result"
        >
          <option value="all">All Results</option>
          <option value="won">Won</option>
          <option value="placed">Placed</option>
          <option value="participated">Participated</option>
          <option value="withdrew">Withdrew</option>
        </select>
        <input
          type="text"
          placeholder="Search archives..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 flex-1 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none min-w-[200px]"
          aria-label="Search archives"
        />
      </div>

      {compareArchives.length === 2 && left && right && (
        <div className="rounded border border-primary/30 bg-primary/5 p-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-primary">Comparing: {left.name} vs {right.name}</span>
            <div className="flex items-center gap-sm">
              <button
                type="button"
                onClick={() => setCompareIds([left.id, right.id])}
                className="rounded bg-primary px-sm py-xs text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826]"
              >
                Compare
              </button>
              <button type="button" onClick={() => setCompareIds([])} className="font-mono text-[10px] text-on-surface-variant hover:text-on-surface">Clear</button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-xl">
          <div className="flex items-center gap-sm">
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
          </div>
        </div>
      )}

      {!loading && view === "grid" && (
        <div className="grid grid-cols-1 gap-sm md:grid-cols-2 lg:grid-cols-3">
          {archives.map((archive) => (
            <div key={archive.id} className="relative">
              <button
                type="button"
                onClick={() => toggleCompare(archive.id)}
                className={`absolute top-sm right-sm z-10 flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold transition-colors ${
                  compareIds.includes(archive.id)
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                }`}
                aria-label={compareIds.includes(archive.id) ? "Remove from comparison" : "Add to comparison"}
              >
                {compareIds.includes(archive.id) ? "1" : "+"}
              </button>
              <ArchiveCard archive={archive} />
            </div>
          ))}
          {archives.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-sm py-xl text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">archive</span>
              <p className="font-mono text-[10px] text-on-surface-variant">No archived workspaces found.</p>
            </div>
          )}
        </div>
      )}

      {!loading && view === "timeline" && (
        <TimelineView archives={archives} />
      )}

      {left && right && (
        <ComparisonView
          left={left}
          right={right}
          onClose={() => setCompareIds([])}
        />
      )}
    </div>
  );
}
