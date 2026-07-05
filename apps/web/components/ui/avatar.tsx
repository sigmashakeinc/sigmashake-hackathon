import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-5 w-5 text-[9px]",
  md: "h-6 w-6 text-[10px]",
  lg: "h-8 w-8 text-body-sm",
  xl: "h-10 w-10 text-body-sm",
} as const;

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials?: string;
  size?: keyof typeof sizeMap;
}

export function Avatar({
  initials,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        "border-surface-variant bg-secondary-container flex items-center justify-center rounded-full border font-mono font-medium text-white",
        sizeMap[size],
        className,
      )}
      role="img"
      aria-label={initials ? `Avatar: ${initials}` : "User avatar"}
      {...props}
    >
      {initials ?? "U"}
    </div>
  );
}
