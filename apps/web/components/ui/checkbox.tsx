import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className="group gap-sm inline-flex cursor-pointer items-start"
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={cn(
            "border-outline-variant text-primary mt-0.5 h-4 w-4 rounded-[2px] border bg-black",
            "focus:ring-primary focus:ring-1 focus:ring-offset-0 focus:outline-none",
            "checked:bg-primary checked:border-primary",
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

Checkbox.displayName = "Checkbox";
