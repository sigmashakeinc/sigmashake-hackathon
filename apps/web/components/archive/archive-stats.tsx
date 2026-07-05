"use client";

import type { ArchiveStats as ArchiveStatsType } from "@/core/archive";

interface ArchiveStatsProps {
  stats: ArchiveStatsType;
}

export function ArchiveStats({ stats }: ArchiveStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-sm md:grid-cols-4">
      <div className="flex flex-col gap-[2px] rounded border border-outline-variant/20 bg-surface-container-low p-sm">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Archived</span>
        <span className="text-h3 font-semibold text-on-surface">{stats.totalArchived}</span>
      </div>
      <div className="flex flex-col gap-[2px] rounded border border-outline-variant/20 bg-surface-container-low p-sm">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Wins</span>
        <span className="text-h3 font-semibold text-[#d4af37]">{stats.wins}</span>
      </div>
      <div className="flex flex-col gap-[2px] rounded border border-outline-variant/20 bg-surface-container-low p-sm">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Placed</span>
        <span className="text-h3 font-semibold text-on-surface">{stats.placements}</span>
      </div>
      <div className="flex flex-col gap-[2px] rounded border border-outline-variant/20 bg-surface-container-low p-sm">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Completed</span>
        <span className="text-h3 font-semibold text-[#3fb950]">{stats.completedProjects}</span>
      </div>
      <div className="flex flex-col gap-[2px] rounded border border-outline-variant/20 bg-surface-container-low p-sm">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Avg Health</span>
        <span className="text-h3 font-semibold text-on-surface">{stats.avgHealthScore}/100</span>
      </div>
      <div className="flex flex-col gap-[2px] rounded border border-outline-variant/20 bg-surface-container-low p-sm">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Avg Completion</span>
        <span className="text-h3 font-semibold text-on-surface">{stats.avgCompletionPct}%</span>
      </div>
      <div className="flex flex-col gap-[2px] rounded border border-outline-variant/20 bg-surface-container-low p-sm">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Avg Readiness</span>
        <span className="text-h3 font-semibold text-on-surface">{stats.avgSubmissionReadiness}%</span>
      </div>
      <div className="flex flex-col gap-[2px] rounded border border-outline-variant/20 bg-surface-container-low p-sm">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Lessons</span>
        <span className="text-h3 font-semibold text-primary">{stats.totalLessons}</span>
      </div>
    </div>
  );
}
