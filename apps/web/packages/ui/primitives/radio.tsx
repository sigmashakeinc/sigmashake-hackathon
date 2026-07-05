"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/packages/utils";

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className="group gap-sm inline-flex cursor-pointer items-center"
      >
        <input
          ref={ref}
          id={id}
          type="radio"
          className={cn(
            "border-outline-variant text-primary h-4 w-4 border bg-black",
            "focus:ring-primary focus:ring-1 focus:ring-offset-0 focus:outline-none",
            className,
          )}
          {...props}
        />
        {label && (
          <span className="text-body-sm text-on-surface group-hover:text-primary transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  },
);

Radio.displayName = "Radio";
