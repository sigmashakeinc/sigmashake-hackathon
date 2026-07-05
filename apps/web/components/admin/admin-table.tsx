"use client";

import { type ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function AdminTable<T>({ columns, data, keyExtractor, emptyMessage }: AdminTableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="py-lg text-center font-mono text-[10px] text-on-surface-variant">
        {emptyMessage ?? "No data found."}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-outline-variant/20">
            {columns.map((col) => (
              <th key={col.key} className={`px-sm py-xs text-left font-mono text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ${col.className ?? ""}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="border-b border-outline-variant/10 transition-colors hover:bg-surface-container-high/50">
              {columns.map((col) => (
                <td key={col.key} className={`px-sm py-xs text-body-sm text-on-surface ${col.className ?? ""}`}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
