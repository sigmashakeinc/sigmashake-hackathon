import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-outline-variant bg-surface-container-lowest px-md text-on-surface-variant flex h-6 shrink-0 items-center justify-between border-t font-mono text-[11px]",
        className,
      )}
    >
      <span>v0.1.0-dev</span>
      <div className="gap-lg flex items-center">
        <span className="hover:text-on-surface cursor-default transition-colors">
          System Health
        </span>
        <span className="hover:text-on-surface cursor-default transition-colors">
          Branch: main
        </span>
        <span className="gap-xs hover:text-on-surface flex cursor-default items-center transition-colors">
          <span className="bg-primary inline-block h-1.5 w-1.5 rounded-full" />
          Sync: OK
        </span>
      </div>
    </footer>
  );
}
