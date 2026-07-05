"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/identity";
import { createAdminService } from "@/core/admin";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/app/admin", icon: "dashboard" },
  { label: "Platform", href: "/app/admin/platform", icon: "dns" },
  { label: "Active Workspace", href: "/app/admin/workspace", icon: "workspaces" },
  { label: "Members", href: "/app/admin/members", icon: "group" },
  { label: "Invitations", href: "/app/admin/invitations", icon: "mail" },
  { label: "Templates", href: "/app/admin/templates", icon: "template" },
  { label: "Integrations", href: "/app/admin/integrations", icon: "extension" },
  { label: "Automation", href: "/app/admin/automation", icon: "auto_awesome" },
  { label: "Storage", href: "/app/admin/storage", icon: "cloud" },
  { label: "Database", href: "/app/admin/database", icon: "storage" },
  { label: "Activity", href: "/app/admin/activity", icon: "pulse" },
  { label: "Maintenance", href: "/app/admin/maintenance", icon: "build" },
  { label: "Diagnostics", href: "/app/admin/diagnostics", icon: "monitor_heart" },
  { label: "Logs", href: "/app/admin/activity", icon: "article" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    createAdminService()
      .isPlatformOwner(user.id)
      .then((owner) => {
        setIsOwner(owner);
        if (!owner) router.replace("/app");
      })
      .catch(() => router.replace("/app"))
      .finally(() => setChecking(false));
  }, [authLoading, isAuthenticated, user, router]);

  if (checking || authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-sm">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  if (!isOwner) return null;

  return (
    <div className="flex h-full">
      <div className="flex w-56 shrink-0 flex-col border-r border-outline-variant/30 bg-surface-container-low">
        <div className="border-b border-outline-variant/30 px-md py-md">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">admin_panel_settings</span>
            <h2 className="text-h2 font-semibold text-on-surface">Admin</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-xs py-sm scrollbar-thin">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-md rounded px-md py-sm text-body-sm transition-colors",
                  isActive
                    ? "bg-surface-container-high font-medium text-on-surface"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}>
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
    </div>
  );
}
