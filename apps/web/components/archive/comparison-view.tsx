"use client";

import type { WorkspaceArchive } from "@/core/archive";

interface ComparisonViewProps {
  left: WorkspaceArchive;
  right: WorkspaceArchive;
  onClose: () => void;
}

function Row({ label, leftVal, rightVal, format }: {
  label: string;
  leftVal: string | number | null | undefined;
  rightVal: string | number | null | undefined;
  format?: (v: string | number) => string;
}) {
  const fmt = (v: string | number | null | undefined) => {
    if (v == null) return "—";
    return format ? format(v) : String(v);
  };
  const better = (a: string | number | null | undefined, b: string | number | null | undefined) => {
    if (typeof a === "number" && typeof b === "number" && a !== b) {
      if (label.includes("Score") || label.includes("Readiness") || label.includes("Completion")) {
        return a > b ? "text-[#3fb950]" : "text-error";
      }
    }
    return "";
  };

  return (
    <div className="grid grid-cols-3 gap-sm border-b border-outline-variant/20 py-sm font-mono text-[10px]">
      <span className="text-on-surface-variant">{label}</span>
      <span className={`text-right ${better(leftVal, rightVal)}`}>{fmt(leftVal)}</span>
      <span className={`text-right ${better(rightVal, leftVal)}`}>{fmt(rightVal)}</span>
    </div>
  );
}

export function ComparisonView({ left, right, onClose }: ComparisonViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 pt-xl">
      <div className="mx-auto w-full max-w-3xl rounded-lg border border-outline-variant bg-surface-container p-lg">
        <div className="mb-md flex items-center justify-between">
          <h2 className="text-h3 font-semibold text-on-surface">Compare Workspaces</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high" aria-label="Close comparison">&times;</button>
        </div>

        <div className="mb-md grid grid-cols-3 gap-sm border-b border-outline-variant pb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span>Metric</span>
          <span className="text-right">{left.name}</span>
          <span className="text-right">{right.name}</span>
        </div>

        <Row label="Status" leftVal={left.status} rightVal={right.status} />
        <Row label="Result" leftVal={left.result} rightVal={right.result} />
        <Row label="Placement" leftVal={left.placement} rightVal={right.placement} />
        <Row label="Prize" leftVal={left.prize} rightVal={right.prize} />
        <Row label="Members" leftVal={left.memberCount} rightVal={right.memberCount} />
        <Row label="Completion %" leftVal={left.completionPct} rightVal={right.completionPct} />
        <Row label="Lessons" leftVal={left.lessonCount ?? 0} rightVal={right.lessonCount ?? 0} />
        <Row label="Retrospective" leftVal={left.hasRetrospective ? "Yes" : "No"} rightVal={right.hasRetrospective ? "Yes" : "No"} />
        <Row label="Technology" leftVal={left.technology} rightVal={right.technology} />
        <Row label="Category" leftVal={left.category} rightVal={right.category} />
        {left.startDate && right.startDate && (
          <Row label="Duration" leftVal={daysBetween(left.startDate, left.endDate) + "d"} rightVal={daysBetween(right.startDate, right.endDate) + "d"} />
        )}
      </div>
    </div>
  );
}

function daysBetween(start: string, end: string | null): number {
  if (!end) return 0;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}
