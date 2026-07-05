"use client";

import { cn } from "@/packages/utils";

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
}

function getPages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function Pagination({
  current,
  total,
  onChange,
  className,
}: PaginationProps) {
  const pages = getPages(current, total);

  return (
    <nav
      aria-label="Pagination"
      className={cn("gap-xs flex items-center", className)}
    >
      <button
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        className="text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex h-7 w-7 items-center justify-center rounded transition-colors disabled:pointer-events-none disabled:opacity-30"
        aria-label="Previous page"
      >
        {"\u2039"}
      </button>
      {pages.map((page, i) => {
        if (page === "ellipsis") {
          return (
            <span key={`e${i}`} className="px-xs text-on-surface-variant">
              {"\u2026"}
            </span>
          );
        }
        const isCurrent = page === current;
        return (
          <button
            key={page}
            onClick={() => onChange(page as number)}
            className={cn(
              "px-xs text-body-sm flex h-7 min-w-[28px] items-center justify-center rounded font-mono transition-colors",
              isCurrent
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
            )}
            aria-current={isCurrent ? "page" : undefined}
          >
            {page}
          </button>
        );
      })}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current >= total}
        className="text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex h-7 w-7 items-center justify-center rounded transition-colors disabled:pointer-events-none disabled:opacity-30"
        aria-label="Next page"
      >
        {"\u203a"}
      </button>
    </nav>
  );
}
