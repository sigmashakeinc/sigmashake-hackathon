"use client";

import type { WorkspaceArchive } from "@/core/archive";

interface TimelineViewProps {
  archives: WorkspaceArchive[];
}

export function TimelineView({ archives }: TimelineViewProps) {
  const sorted = [...archives].filter((a) => a.startDate).sort(
    (a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime()
  );

  return (
    <div className="relative flex flex-col gap-md pl-lg" role="list" aria-label="Archive timeline">
      <div className="absolute left-[7px] top-0 bottom-0 w-px bg-outline-variant/30" />
      {sorted.length === 0 && (
        <p className="py-md font-mono text-[10px] text-on-surface-variant">No archived workspaces yet.</p>
      )}
      {sorted.map((archive) => (
        <div key={archive.id} className="relative flex items-start gap-sm" role="listitem">
          <div className={`absolute -left-[17px] mt-[6px] h-[14px] w-[14px] rounded-full border-2 ${
            archive.result === "won" ? "border-[#d4af37] bg-[#d4af37]/20"
            : archive.status === "completed" ? "border-[#3fb950] bg-[#3fb950]/20"
            : archive.status === "cancelled" ? "border-on-surface-variant bg-surface-container-high"
            : "border-primary bg-primary/20"
          }`} />
          <div className="flex flex-1 flex-col gap-[2px]">
            <div className="flex items-center gap-sm">
              <span className="font-mono text-[10px] font-medium text-on-surface">{archive.name}</span>
              <span className="font-mono text-[9px] text-on-surface-variant">
                {archive.startDate ? new Date(archive.startDate).toLocaleDateString() : "—"}
              </span>
              {archive.result === "won" && <span className="font-mono text-[9px] text-[#d4af37]">Winner</span>}
            </div>
            <p className="font-mono text-[9px] text-on-surface-variant">
              {archive.organizer} &middot; {archive.memberCount} member{archive.memberCount !== 1 ? "s" : ""} &middot; {archive.completionPct}% complete
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
