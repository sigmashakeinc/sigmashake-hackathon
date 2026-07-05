import type { ReactNode } from "react";
import { cn } from "@/packages/utils";
import { TOPNAV_HEIGHT, FOOTER_HEIGHT } from "@/packages/constants";

interface ThreePanelLayoutProps {
  sidebar: ReactNode;
  topnav?: ReactNode;
  footer?: ReactNode;
  center: ReactNode;
  inspector?: ReactNode;
  className?: string;
  inspectorWidth?: number;
}

export function ThreePanelLayout({
  sidebar,
  topnav,
  footer,
  center,
  inspector,
  className,
  inspectorWidth = 360,
}: ThreePanelLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {sidebar}
      <main className="flex min-w-0 flex-1 flex-col">
        {topnav && (
          <div style={{ height: TOPNAV_HEIGHT }} className="shrink-0">
            {topnav}
          </div>
        )}
        <div className="flex flex-1 overflow-hidden">
          <div className={cn("flex-1 scrollbar-thin overflow-auto", className)}>
            {center}
          </div>
          {inspector && (
            <div
              className="border-outline-variant hidden shrink-0 border-l lg:block"
              style={{ width: inspectorWidth }}
            >
              {inspector}
            </div>
          )}
        </div>
        {footer && (
          <div style={{ height: FOOTER_HEIGHT }} className="shrink-0">
            {footer}
          </div>
        )}
      </main>
    </div>
  );
}
