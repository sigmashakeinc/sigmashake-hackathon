"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SectionItem {
  label: string;
  href: string;
  icon: string;
  danger?: boolean;
}

interface Section {
  label: string;
  items: SectionItem[];
}

const sections: Section[] = [
  {
    label: "Profile",
    items: [
      { label: "Profile", href: "/app/settings/profile", icon: "person" },
      { label: "Account", href: "/app/settings/account", icon: "lock" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Hackathon", href: "/app/settings/hackathon", icon: "emoji_events" },
    ],
  },
  {
    label: "Team",
    items: [
      { label: "Team", href: "/app/settings/team", icon: "group" },
      { label: "Invitations", href: "/app/settings/invitations", icon: "mail" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Security", href: "/app/settings/security", icon: "shield" },
      { label: "Storage", href: "/app/settings/storage", icon: "cloud" },
      { label: "Developer", href: "/app/settings/developer", icon: "code" },
      { label: "About", href: "/app/settings/about", icon: "info" },
    ],
  },
  {
    label: "Danger Zone",
    items: [
      { label: "Danger Zone", href: "/app/settings/danger-zone", icon: "warning", danger: true },
    ],
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      <div className="flex w-56 shrink-0 flex-col border-r border-outline-variant/30 bg-surface-container-low">
        <div className="border-b border-outline-variant/30 px-md py-md">
          <h2 className="text-h2 font-semibold text-on-surface">Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-xs py-sm scrollbar-thin">
          {sections.map((section) => (
            <div key={section.label} className="mb-md">
              <p className="mb-xs px-md font-mono text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                {section.label}
              </p>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-md rounded px-md py-sm text-body-sm transition-colors",
                      isActive
                        ? "bg-surface-container-high font-medium text-on-surface"
                        : item.danger
                          ? "text-error hover:bg-error/5"
                          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                    )}
                  >
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </div>
    </div>
  );
}
