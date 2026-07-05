"use client";

import Link from "next/link";
import type { WorkspaceArchive } from "@/core/archive";

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  cancelled: "Cancelled",
  abandoned: "Abandoned",
  imported: "Imported",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "text-[#3fb950]",
  cancelled: "text-on-surface-variant",
  abandoned: "text-error",
  imported: "text-primary",
};

const RESULT_BADGES: Record<string, { label: string; color: string }> = {
  won: { label: "Winner", color: "bg-[#d4af37] text-black" },
  placed: { label: "Placed", color: "bg-surface-container-highest text-on-surface" },
  participated: { label: "Participated", color: "bg-surface-container-high text-on-surface-variant" },
  withdrew: { label: "Withdrew", color: "bg-error/10 text-error" },
  none: { label: "—", color: "bg-surface-container text-on-surface-variant" },
};

interface ArchiveCardProps {
  archive: WorkspaceArchive;
}

export function ArchiveCard({ archive }: ArchiveCardProps) {
  const resultBadge = archive.result ? RESULT_BADGES[archive.result] ?? RESULT_BADGES.none : null;

  return (
    <Link
      href={`/app/archive/${archive.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-low transition-all duration-150 hover:border-outline-variant/60 hover:shadow-sm"
      aria-label={`${archive.name} — ${archive.organizer}`}
    >
      <div className="flex flex-col gap-sm p-md">
        <div className="flex items-start justify-between gap-sm">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
              {archive.name}
            </h3>
            <p className="truncate font-mono text-[10px] text-on-surface-variant">
              {archive.organizer}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-xs">
            {resultBadge && archive.result !== "none" && (
              <span className={`rounded px-[4px] py-[1px] font-mono text-[9px] font-medium ${resultBadge.color}`}>
                {resultBadge.label}
              </span>
            )}
            {archive.prize && (
              <span className="font-mono text-[10px] text-[#d4af37]">{archive.prize}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-md font-mono text-[10px] text-on-surface-variant">
          <span className={STATUS_COLORS[archive.status] ?? "text-on-surface-variant"}>
            {STATUS_LABELS[archive.status] ?? archive.status}
          </span>
          {archive.startDate && (
            <span>{new Date(archive.startDate).toLocaleDateString()}</span>
          )}
          <span>{archive.memberCount} member{archive.memberCount !== 1 ? "s" : ""}</span>
        </div>

        <div className="flex items-center gap-sm">
          <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="rounded-full bg-primary transition-all"
              style={{ width: `${archive.completionPct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-on-surface-variant">{archive.completionPct}%</span>
        </div>

        <div className="flex items-center gap-md">
          {archive.lessonCount !== undefined && archive.lessonCount > 0 && (
            <span className="font-mono text-[9px] text-on-surface-variant">
              {archive.lessonCount} lesson{archive.lessonCount !== 1 ? "s" : ""}
            </span>
          )}
          {archive.hasRetrospective && (
            <span className="font-mono text-[9px] text-primary">Has retrospective</span>
          )}
          {archive.submissionStatus && (
            <span className="font-mono text-[9px] text-on-surface-variant">
              {archive.submissionStatus}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
