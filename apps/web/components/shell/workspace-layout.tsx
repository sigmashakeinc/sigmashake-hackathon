import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { TopNav } from "./topnav";
import { Footer } from "./footer";

interface WorkspaceLayoutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function WorkspaceLayout({
  children,
  title,
  className,
}: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopNav title={title} />
        <div className={cn("flex-1 scrollbar-thin overflow-auto", className)}>
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
