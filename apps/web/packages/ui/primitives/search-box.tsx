"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/packages/utils";

interface SearchBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ className, onSearch: _onSearch, ...props }, ref) => {
    return (
      <div className="relative">
        <span className="material-symbols-outlined left-sm text-on-surface-variant pointer-events-none absolute top-1/2 -translate-y-1/2 text-[16px]">
          search
        </span>
        <input
          ref={ref}
          type="text"
          className={cn(
            "border-outline-variant pr-sm text-body-sm text-on-surface w-full rounded border bg-black py-[4px] pl-8 transition-all duration-150",
            "placeholder:text-on-surface-variant/50",
            "focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

SearchBox.displayName = "SearchBox";
