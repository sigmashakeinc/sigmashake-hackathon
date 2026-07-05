"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/identity";
import { useHackathon } from "@/core/hackathon";
import { createTaskService, type Task } from "@/core/tasks";
import { createNotificationService, NOTIFICATION_LABELS } from "@/core/notifications";
import { createCommentService, type Mention } from "@/core/comments";
import { createReviewService, type Review } from "@/core/reviews";

export default function MyDashboardPage() {
  const { user } = useAuth();
  const { activeHackathon } = useHackathon();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; title: string; type: string; createdAt: string }[]>([]);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!activeHackathon || !user) return;
    createTaskService().list(activeHackathon.id).then(setTasks).catch((err) => console.error("[Page] error:", err));
    createNotificationService().list(user.id).then((n) => setNotifications(n.slice(0, 10))).catch((err) => console.error("[Page] error:", err));
    createCommentService().getMentions(user.id).then(setMentions).catch((err) => console.error("[Page] error:", err));
    createReviewService().getPendingReviews(user.id).then(setPendingReviews).catch((err) => console.error("[Page] error:", err));
  }, [activeHackathon, user]);

  const myTasks = tasks.filter((t) => t.owner === user?.username || t.assignees?.includes(user?.username ?? ""));
  const dueTasks = myTasks.filter((t) => t.dueDate && t.status !== "done").sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <div className="p-lg">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-lg">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">My Workspace</h1>
          <p className="font-mono text-[11px] text-on-surface-variant">
            {user?.displayName ?? user?.username}
            {activeHackathon ? ` · ${activeHackathon.name}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
          {/* Mentions */}
          {mentions.length > 0 && (
            <div className="rounded border border-[#d29922]/30 bg-[#d29922]/5 p-lg">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#d29922]">
                  Mentions ({mentions.filter((m) => !m.read).length} unread)
                </h2>
                <Link href="/app/notifications" className="font-mono text-[9px] text-primary">View all</Link>
              </div>
              <div className="mt-md flex flex-col gap-xs">
                {mentions.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center gap-sm rounded bg-surface-container-lowest px-md py-sm">
                    <span className="material-symbols-outlined text-[14px] text-[#d29922]">alternate_email</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm text-on-surface truncate">@{m.mentionedUsername} mentioned you</p>
                      <p className="font-mono text-[9px] text-on-surface-variant">{new Date(m.createdAt).toLocaleDateString()}</p>
                    </div>
                    {!m.read && <span className="h-2 w-2 rounded-full bg-[#d29922]" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Reviews */}
          {pendingReviews.length > 0 && (
            <div className="rounded border border-primary/30 bg-primary/5 p-lg">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                  Pending Reviews ({pendingReviews.length})
                </h2>
                <Link href="/app/tasks" className="font-mono text-[9px] text-primary">View all</Link>
              </div>
              <div className="mt-md flex flex-col gap-xs">
                {pendingReviews.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center gap-sm rounded bg-surface-container-lowest px-md py-sm">
                    <span className="material-symbols-outlined text-[14px] text-primary">rate_review</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm text-on-surface truncate">{r.title}</p>
                      <p className="font-mono text-[9px] text-on-surface-variant">{r.module} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Tasks */}
          <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">My Tasks</h2>
              <Link href="/app/tasks" className="font-mono text-[9px] text-primary">View all</Link>
            </div>
            {myTasks.length === 0 ? (
              <p className="mt-md font-mono text-[10px] text-on-surface-variant">No assigned tasks</p>
            ) : (
              <div className="mt-md flex flex-col gap-xs">
                {myTasks.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded border border-outline-variant/30 bg-surface-container-lowest px-md py-sm">
                    <p className="text-body-sm text-on-surface truncate">{t.title}</p>
                    <span className={`rounded px-xs py-[1px] font-mono text-[9px] ${
                      t.status === "done" ? "text-[#3fb950]" : t.status === "blocked" ? "text-error" : "text-on-surface-variant"
                    }`}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Upcoming Deadlines</h2>
            {dueTasks.length === 0 ? (
              <p className="mt-md font-mono text-[10px] text-on-surface-variant">No upcoming deadlines</p>
            ) : (
              <div className="mt-md flex flex-col gap-xs">
                {dueTasks.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded border border-outline-variant/30 bg-surface-container-lowest px-md py-sm">
                    <p className="text-body-sm text-on-surface truncate">{t.title}</p>
                    <span className="font-mono text-[9px] text-on-surface-variant">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Recent Activity</h2>
              <Link href="/app/notifications" className="font-mono text-[9px] text-primary">View all</Link>
            </div>
            {notifications.length === 0 ? (
              <p className="mt-md font-mono text-[10px] text-on-surface-variant">No recent activity</p>
            ) : (
              <div className="mt-md flex flex-col gap-xs">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-sm rounded px-md py-sm transition-colors hover:bg-surface-container-high">
                    <p className="text-body-sm text-on-surface">{n.title}</p>
                    <p className="font-mono text-[9px] text-on-surface-variant">{NOTIFICATION_LABELS[n.type]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
            <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Quick Actions</h2>
            <div className="flex flex-col gap-xs">
              <Link href="/app/tasks" className="flex items-center gap-sm rounded px-sm py-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">add</span>Create Task
              </Link>
              <Link href="/app/ideas" className="flex items-center gap-sm rounded px-sm py-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">add</span>New Idea
              </Link>
              <Link href="/app/notes" className="flex items-center gap-sm rounded px-sm py-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">add</span>New Note
              </Link>
              <Link href="/app/submission-prep" className="flex items-center gap-sm rounded px-sm py-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">task_alt</span>Submission Prep
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
