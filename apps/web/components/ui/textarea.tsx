import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "border-outline-variant px-md py-sm text-body-sm text-on-surface w-full rounded border bg-black transition-colors duration-150",
        "placeholder:text-on-surface-variant/50",
        "focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none",
        "caret-primary min-h-[80px] resize-y",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
