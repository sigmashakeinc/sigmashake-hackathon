"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/identity";
import { createNotificationService, NOTIFICATION_LABELS } from "@/core/notifications";

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<{ id: string; title: string; type: string; createdAt: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const svc = createNotificationService();
    svc.getUnreadCount(user.id).then(setUnreadCount).catch((err) => console.error("[Page] error:", err));
    svc.list(user.id).then((n) => setNotifications(n.slice(0, 5))).catch((err) => console.error("[Page] error:", err));
    const interval = setInterval(() => { svc.getUnreadCount(user.id).then(setUnreadCount).catch((err) => console.error("[Page] error:", err)); }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  async function markAllRead() {
    if (!user) return;
    await createNotificationService().markAllAsRead(user.id);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n })));
  }

  return (
    <div ref={menuRef} className="relative">
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}>
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-primary px-[3px] text-[9px] font-bold leading-none text-on-primary">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-xs w-80 rounded border border-outline-variant bg-surface-container-low shadow-lg">
          <div className="flex items-center justify-between border-b border-outline-variant/30 px-md py-sm">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Notifications</h3>
            <div className="flex gap-sm">
              {unreadCount > 0 && (
                <button type="button" onClick={markAllRead}
                  className="font-mono text-[9px] text-primary transition-opacity hover:opacity-80">Mark all read</button>
              )}
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <p className="px-md py-lg text-center font-mono text-[10px] text-on-surface-variant">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-sm border-b border-outline-variant/10 px-md py-sm transition-colors hover:bg-surface-container-high">
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm text-on-surface">{n.title}</p>
                    <p className="font-mono text-[9px] text-on-surface-variant">{NOTIFICATION_LABELS[n.type] ?? n.type} · {timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-outline-variant/30 px-md py-sm">
            <Link href="/app/notifications" onClick={() => setIsOpen(false)}
              className="font-mono text-[9px] text-primary transition-opacity hover:opacity-80">View all →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
