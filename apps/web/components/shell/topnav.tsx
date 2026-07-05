"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/identity";
import { NotificationBell } from "@/components/notifications";
import { cn } from "@/lib/utils";

interface TopNavProps {
  className?: string;
  title?: string;
}

export function TopNav({ className, title = "SSG-Hackathon" }: TopNavProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.replace("/");
  }

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() ?? "SS";

  return (
    <header className={cn("flex h-12 shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-md", className)}>
      <div className="flex items-center gap-lg">
        <div className="hidden items-center gap-sm md:flex">
          <Image src="/logo-192.png" alt="SSG-Hackathon" width={24} height={24} className="rounded object-contain" />
          <h1 className="text-h1 font-semibold text-on-surface">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-md">
        <Link href="/app/me" className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" aria-label="My workspace">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </Link>
        <Link href="/app/notifications" className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" aria-label="Notifications">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </Link>
        <NotificationBell />
        <div className="relative" ref={menuRef}>
          <button type="button" onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded border border-surface-variant bg-surface-container-highest font-mono text-[10px] text-on-surface transition-colors hover:border-primary"
            aria-label="User menu" aria-expanded={menuOpen} aria-haspopup="true">
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-xs min-w-[180px] rounded border border-outline-variant bg-surface-container-low p-xs shadow-lg" role="menu">
              <div className="border-b border-outline-variant/30 px-md py-sm">
                <p className="text-body-sm font-medium text-on-surface">{user?.displayName ?? user?.username}</p>
                <p className="font-mono text-[10px] text-on-surface-variant">{user?.email}</p>
              </div>
              <Link href="/app/me" className="flex w-full items-center rounded px-md py-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" role="menuitem">My Workspace</Link>
              <Link href="/app/notifications" className="flex w-full items-center rounded px-md py-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" role="menuitem">Notifications</Link>
              <Link href="/app/settings/profile" className="flex w-full items-center rounded px-md py-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" role="menuitem">Settings</Link>
              <button type="button" role="menuitem" onClick={handleSignOut}
                className="flex w-full items-center rounded px-md py-sm text-body-sm text-error transition-colors hover:bg-error/5">Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
