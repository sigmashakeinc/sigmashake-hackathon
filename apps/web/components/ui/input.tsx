import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, startIcon, label, error, id, type = "text", ...props },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="gap-xs flex flex-col">
        {label && (
          <label
            htmlFor={inputId}
            className="text-on-surface font-mono text-[10px] font-bold tracking-widest uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className="left-sm text-on-surface-variant pointer-events-none absolute top-1/2 -translate-y-1/2">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={!!error}
            className={cn(
              "px-md py-sm text-body-sm text-on-surface w-full rounded border bg-black transition-colors duration-150",
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
          <p role="alert" className="text-error font-mono text-[10px]">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
