"use client";

import { cn } from "@/packages/utils";

interface ContributionChartProps {
  data: { name: string; assigned: number; completed: number }[];
  className?: string;
}

export function ContributionChart({ data, className }: ContributionChartProps) {
  const max = Math.max(...data.map((d) => Math.max(d.assigned, d.completed)), 1);

  return (
    <div className={cn("flex flex-col gap-sm", className)} role="region" aria-label="Member contribution">
      {data.map((member) => (
        <div key={member.name} className="flex items-center gap-sm">
          <span className="w-24 truncate font-mono text-[10px] text-on-surface">{member.name}</span>
          <div className="flex flex-1 items-center gap-[2px]">
            <div
              className="h-2 rounded-sm bg-on-surface-variant/40 transition-all duration-500"
              style={{ width: `${(member.assigned / max) * 100}%` }}
              role="progressbar"
              aria-valuenow={member.assigned}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-label={`${member.name}: ${member.assigned} assigned`}
            />
            <div
              className="h-2 rounded-sm bg-primary transition-all duration-500"
              style={{ width: `${(member.completed / max) * 100}%` }}
              role="progressbar"
              aria-valuenow={member.completed}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-label={`${member.name}: ${member.completed} completed`}
            />
          </div>
          <span className="w-16 text-right font-mono text-[10px] text-on-surface-variant">
            {member.completed}/{member.assigned}
          </span>
        </div>
      ))}
    </div>
  );
}
