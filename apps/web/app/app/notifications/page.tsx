"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/identity";
import { createNotificationService, NOTIFICATION_LABELS, NOTIFICATION_ICONS, type Notification } from "@/core/notifications";

export default function NotificationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("unread");

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setIsFetching(true);
    createNotificationService().list(user.id, filter === "archived").then(setNotifications).catch((err) => console.error("[Page] error:", err)).finally(() => setIsFetching(false));
  }, [isAuthenticated, user, filter]);

  async function handleRead(id: string) {
    await createNotificationService().markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function handleArchive(id: string) {
    await createNotificationService().archive(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleMarkAllRead() {
    if (!user) return;
    await createNotificationService().markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  if (isLoading) return null;

  return (
    <div className="mx-auto max-w-3xl p-lg">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">Notifications</h1>
          <p className="font-mono text-[11px] text-on-surface-variant">Stay updated on what matters</p>
        </div>
        <div className="flex items-center gap-sm">
          {notifications.some((n) => !n.read) && (
            <button type="button" onClick={handleMarkAllRead}
              className="rounded bg-primary px-sm py-xs text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">Mark all read</button>
          )}
        </div>
      </div>

      <div className="mt-md flex gap-sm">
        {(["unread", "all", "archived"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={`rounded px-sm py-xs text-body-sm ${filter === f ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isFetching ? (
        <div className="flex items-center justify-center py-xl">
          <div className="flex items-center gap-sm">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-sm py-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">notifications</span>
          <p className="text-body-sm text-on-surface-variant">{filter === "unread" ? "No unread notifications" : "No notifications"}</p>
        </div>
      ) : (
        <div className="mt-md flex flex-col gap-xs">
          {notifications.map((n) => (
            <div key={n.id} className={`flex items-start gap-md rounded border px-lg py-md transition-colors ${n.read ? "border-outline-variant/30 bg-surface-container-low" : "border-primary/30 bg-primary/5"}`}>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{NOTIFICATION_ICONS[n.type] ?? "notifications"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-body-sm font-medium text-on-surface">{n.title}</p>
                {n.message && <p className="mt-xs text-body-sm text-on-surface-variant">{n.message}</p>}
                <div className="mt-xs flex gap-sm font-mono text-[9px] text-on-surface-variant">
                  <span>{NOTIFICATION_LABELS[n.type] ?? n.type}</span>
                  <span>{timeAgo(n.createdAt)}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-sm">
                {!n.read && (
                  <button type="button" onClick={() => handleRead(n.id)}
                    className="font-mono text-[9px] text-primary transition-opacity hover:opacity-80">Read</button>
                )}
                <button type="button" onClick={() => handleArchive(n.id)}
                  className="font-mono text-[9px] text-on-surface-variant transition-opacity hover:text-error">Archive</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
