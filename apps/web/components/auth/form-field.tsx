"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/packages/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  startIcon?: ReactNode;
  helperText?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    { label, error, startIcon, helperText, id, className, required, ...props },
    ref,
  ) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="gap-xs flex flex-col">
        <label
          htmlFor={inputId}
          className="text-on-surface font-mono text-[10px] font-bold tracking-widest uppercase"
        >
          {label}
          {required && (
            <span className="text-primary ml-[2px]" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="relative">
          {startIcon && (
            <div className="left-md text-on-surface-variant pointer-events-none absolute top-1/2 -translate-y-1/2">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            className={cn(
              "px-md py-md text-body-sm text-on-surface w-full rounded border bg-black transition-colors duration-150",
              "placeholder:text-on-surface-variant/50",
              "caret-primary",
              "focus:outline-none",
              error
                ? "border-error focus:border-error focus:ring-error focus:ring-1"
                : "border-outline-variant focus:border-primary focus:ring-primary focus:ring-1",
              startIcon && "pl-10",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-error font-mono text-[10px]"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-on-surface-variant font-mono text-[10px]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";
