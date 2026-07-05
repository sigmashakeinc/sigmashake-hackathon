"use client";

import type { ReactNode } from "react";

interface AdminCardProps {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
  color?: string;
  children?: ReactNode;
}

export function AdminCard({ label, value, icon, sub, color, children }: AdminCardProps) {
  return (
    <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
          <p className={`mt-xs text-[28px] font-bold leading-none ${color ?? "text-on-surface"}`}>{value}</p>
          {sub && <p className="mt-xs font-mono text-[9px] text-on-surface-variant">{sub}</p>}
        </div>
        <span className="material-symbols-outlined text-[24px] text-on-surface-variant/40">{icon}</span>
      </div>
      {children}
    </div>
  );
}
