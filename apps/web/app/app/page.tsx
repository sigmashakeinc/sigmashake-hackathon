"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHackathon } from "@/core/hackathon";
import { loadMissionControl, type MissionControlData } from "@/core/mission-control";
import { createActivityService, MODULE_ICONS, type ActivityEvent } from "@/core/activity";
import { createAnalyticsService, type WorkspaceHealth } from "@/core/analytics";
import { createArchiveService, type WorkspaceArchive } from "@/core/archive";
import { createCommentService } from "@/core/comments";
import { createReviewService } from "@/core/reviews";
import { createIntegrationService } from "@/core/integrations";
import { createAutomationService } from "@/core/automation";
import { createAdminService } from "@/core/admin";
import { useAuth } from "@/identity";
import { formatTimeAgo, ProgressWidget, TodayWidget, BlockerWidget, QuickAction } from "@/components/mission-control";
import { config } from "@/services/config";

export default function MissionControlPage() {
  const { activeHackathon } = useHackathon();
  const { user } = useAuth();
  const [data, setData] = useState<MissionControlData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [health, setHealth] = useState<WorkspaceHealth | null>(null);
  const [archiveStats, setArchiveStats] = useState<{ totalArchived: number; wins: number; totalLessons: number } | null>(null);
  const [recentArchive, setRecentArchive] = useState<WorkspaceArchive | null>(null);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [unreadMentionCount, setUnreadMentionCount] = useState(0);
  const [integrationCount, setIntegrationCount] = useState(0);
  const [integrationErrors, setIntegrationErrors] = useState(0);
  const [autoRuleCount, setAutoRuleCount] = useState(0);
  const [autoFailedRuns, setAutoFailedRuns] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  // Live countdown
  useEffect(() => {
    if (!activeHackathon?.endDate) return;
    const tick = () => {
      const diff = new Date(activeHackathon.endDate!).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick(); const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [activeHackathon?.endDate]);

  useEffect(() => {
    if (!activeHackathon) return;
    setIsLoading(true);
    Promise.all([
      loadMissionControl(activeHackathon.id),
      createActivityService().list(activeHackathon.id, 10),
      createAnalyticsService().health(activeHackathon.id),
      createArchiveService().stats(),
      createArchiveService().list({ status: "completed" }),
      user ? createReviewService().getPendingReviews(user.id) : Promise.resolve([]),
      user ? createCommentService().getUnreadMentionCount(user.id) : Promise.resolve(0),
      createIntegrationService().getConnections(activeHackathon.id),
      createAutomationService().listRules(activeHackathon.id),
      createAutomationService().getRecentRuns(activeHackathon.id),
      user ? createAdminService().isPlatformOwner(user.id) : Promise.resolve(false),
    ]).then(([d, a, h, as_, al, reviews, mentions, integrations, autoRules, autoRuns, owner]) => {
      setData(d); setActivity(a); setHealth(h);
      setArchiveStats({ totalArchived: as_.totalArchived, wins: as_.wins, totalLessons: as_.totalLessons });
      setRecentArchive(al[0] ?? null);
      setPendingReviewCount(reviews.length);
      setUnreadMentionCount(mentions as number);
      setIntegrationCount(integrations.length);
      setIntegrationErrors(integrations.filter((c: { status: string }) => c.status === "error").length);
      setAutoRuleCount(autoRules.filter((r: { enabled: boolean }) => r.enabled).length);
      setAutoFailedRuns(autoRuns.filter((r: { status: string }) => r.status === "failed").length);
      setIsOwner(owner as boolean);
    }).catch((err) => console.error("[Page] error:", err)).finally(() => setIsLoading(false));
  }, [activeHackathon, user]);

  // Determine submission readiness
  const subPct = data ? (data.deliverables.total > 0 ? Math.round((data.deliverables.complete / data.deliverables.total) * 100) : 0) : 0;
  const subReadinessLabel = data?.submission.locked ? "Submission Locked" : data?.submission.status === "submitted" ? "Submitted" : subPct >= 90 ? "Ready" : subPct >= 50 ? "Needs Work" : "Getting Started";
  const subReadinessColor = data?.submission.locked ? "text-primary" : subPct >= 90 ? "text-[#3fb950]" : subPct >= 50 ? "text-[#d29922]" : "text-on-surface-variant";

  return (
    <div className="overflow-y-auto p-lg scrollbar-thin">
      <div className="mx-auto max-w-[1600px]">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-sm">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          </div>
        ) : !activeHackathon ? (
          <div className="flex flex-col items-center gap-md py-xl text-center">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/20">rocket_launch</span>
            <h1 className="text-h1 font-semibold text-on-surface">Welcome to SSG-Hackathon</h1>
            <p className="text-body-sm text-on-surface-variant">Create your first hackathon to get started.</p>
            <Link href="/app/hackathons/new"
              className="inline-flex items-center gap-sm rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">
              <span className="material-symbols-outlined text-[16px]">add</span>Create Hackathon
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-lg flex items-start justify-between">
              <div>
                <h1 className="text-h1 font-semibold text-on-surface">{activeHackathon.name}</h1>
                <p className="font-mono text-[11px] text-on-surface-variant">
                  {activeHackathon.organizer}{activeHackathon.location ? ` · ${activeHackathon.location}` : ""}
                  {timeLeft ? ` · ${timeLeft} remaining` : ""}
                </p>
              </div>
              <div className="flex items-center gap-sm">
                <Link href="/app/planning" className="rounded border border-outline-variant bg-black px-sm py-xs text-body-sm text-on-surface transition-colors hover:border-on-surface">Planning</Link>
                <Link href="/app/tasks" className="rounded border border-outline-variant bg-black px-sm py-xs text-body-sm text-on-surface transition-colors hover:border-on-surface">Tasks</Link>
                <Link href="/app/submission-prep" className="rounded bg-primary px-sm py-xs text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">Submission</Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
              {/* Left column - Progress + Countdown */}
              <div className="flex flex-col gap-lg lg:col-span-2">
                {/* Progress overview */}
                <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                  <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Progress Overview</h2>
                  <div className="grid grid-cols-2 gap-md sm:grid-cols-3">
                    <ProgressWidget label="Planning" pct={data?.planning.pct ?? 0} sub={data?.planning.label ?? ""} color="bg-primary" />
                    <ProgressWidget label="Ideas" pct={data?.ideas.pct ?? 0} sub={data?.ideas.label ?? ""} color="bg-[#d29922]" />
                    <ProgressWidget label="Research" pct={data?.research.pct ?? 0} sub={data?.research.label ?? ""} color="bg-[#3fb950]" />
                    <ProgressWidget label="Tasks" pct={data?.tasks.total ? Math.round((data.tasks.done / data.tasks.total) * 100) : 0} sub={`${data?.tasks.done ?? 0}/${data?.tasks.total ?? 0}`} color="bg-primary" />
                    <ProgressWidget label="Deliverables" pct={subPct} sub={`${data?.deliverables.complete ?? 0}/${data?.deliverables.total ?? 0}`} color="bg-[#3fb950]" />
                    <ProgressWidget label="Overall" pct={data?.overall.pct ?? 0} sub={data?.overall.label ?? ""} color={data && data.overall.pct >= 80 ? "bg-[#3fb950]" : "bg-primary"} large />
                  </div>
                </div>

                {/* Submission Readiness */}
                <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Submission Readiness</h2>
                      <p className={`mt-xs text-[48px] font-bold leading-none tracking-tight ${subReadinessColor}`}>{subPct}%</p>
                      <p className="mt-xs font-mono text-[10px] text-on-surface-variant">{subReadinessLabel}</p>
                    </div>
                    <Link href="/app/submission-prep" className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface transition-colors hover:border-on-surface">Submission Prep</Link>
                  </div>
                </div>

                {/* Team Snapshot + My Work */}
                <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
                  <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                    <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Team</h2>
                    <div className="flex items-center gap-md">
                      <span className="text-[32px] font-bold text-on-surface">{data?.team.total ?? 0}</span>
                      <span className="font-mono text-[10px] text-on-surface-variant">members</span>
                    </div>
                    <div className="mt-sm flex gap-md font-mono text-[10px] text-on-surface-variant">
                      <span>{data?.team.owners ?? 0} owner{data?.team.owners !== 1 ? "s" : ""}</span>
                      <span>{data?.team.leads ?? 0} lead{data?.team.leads !== 1 ? "s" : ""}</span>
                      <span>{data?.team.members ?? 0} member{data?.team.members !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="mt-md">
                      <Link href="/app/team" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">View Team →</Link>
                    </div>
                  </div>
                  <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                    <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">My Work</h2>
                    {data && data.myWork.assignedTasks > 0 ? (
                      <div className="flex flex-col gap-xs">
                        <span className="text-[32px] font-bold text-on-surface">{data.myWork.assignedTasks}</span>
                        <span className="font-mono text-[10px] text-on-surface-variant">assigned task{data.myWork.assignedTasks !== 1 ? "s" : ""}</span>
                      </div>
                    ) : (
                      <p className="font-mono text-[10px] text-on-surface-variant">No assigned tasks</p>
                    )}
                    <div className="mt-md">
                      <Link href="/app/tasks" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">View Tasks →</Link>
                    </div>
                  </div>
                </div>

                {/* Today */}
                <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                  <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Today</h2>
                  <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
                    <TodayWidget label="Tasks Due" count={data?.tasks.dueToday ?? 0} />
                    <TodayWidget label="In Progress" count={data?.tasks.inProgress ?? 0} color="text-primary" />
                    <TodayWidget label="Blocked" count={data?.tasks.blocked ?? 0} color="text-error" />
                    <TodayWidget label="Done" count={data?.tasks.done ?? 0} color="text-[#3fb950]" />
                  </div>
                </div>

                {/* Blockers */}
                {data && (data.blockers.blockedTasks > 0 || data.blockers.blockedDeliverables > 0 || data.blockers.highRisks > 0 || data.blockers.missingSubmission > 0) && (
                  <div className="rounded border border-error/30 bg-error/5 p-lg">
                    <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-error">Blockers</h2>
                    <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
                      {data.blockers.blockedTasks > 0 && <BlockerWidget label="Blocked Tasks" count={data.blockers.blockedTasks} />}
                      {data.blockers.blockedDeliverables > 0 && <BlockerWidget label="Blocked Deliverables" count={data.blockers.blockedDeliverables} />}
                      {data.blockers.highRisks > 0 && <BlockerWidget label="High Risks" count={data.blockers.highRisks} />}
                      {data.blockers.missingSubmission > 0 && <BlockerWidget label="Missing Submission" count={data.blockers.missingSubmission} />}
                    </div>
                  </div>
                )}

                {/* Upcoming */}
                <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                  <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Upcoming</h2>
                  <div className="flex flex-wrap gap-lg font-mono text-[10px] text-on-surface-variant">
                    <span>{data?.upcoming.milestones ?? 0} active milestone{(data?.upcoming.milestones ?? 0) !== 1 ? "s" : ""}</span>
                    <span>{data?.upcoming.deadlines ?? 0} task deadline{(data?.upcoming.deadlines ?? 0) !== 1 ? "s" : ""}</span>
                    {activeHackathon.endDate && <span>Submission: {new Date(activeHackathon.endDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>

              {/* Right column - Quick Actions + Activity */}
              <div className="flex flex-col gap-lg">
                {/* Quick Actions */}
                <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                  <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Quick Actions</h2>
                  <div className="flex flex-col gap-xs">
                    <QuickAction href="/app/tasks" icon="add" label="Create Task" />
                    <QuickAction href="/app/ideas" icon="lightbulb" label="New Idea" />
                    <QuickAction href="/app/notes" icon="note" label="New Note" />
                    <QuickAction href="/app/files" icon="upload" label="Upload File" />
                    <QuickAction href="/app/research" icon="travel_explore" label="Add Research" />
                    <QuickAction href="/app/team/invitations" icon="group" label="Invite Member" />
                    <QuickAction href="/app/submission-prep" icon="task_alt" label="Submission Prep" />
                    <QuickAction href="/app/planning" icon="map" label="View Planning" />
                    <QuickAction href="/app/archive" icon="archive" label="View Archive" />
                  </div>
                </div>

                {/* Analytics Summary */}
                {health && (
                  <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                    <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Analytics Summary</h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[28px] font-bold leading-none text-on-surface">{health.healthScore}</p>
                        <p className="mt-xs font-mono text-[10px] text-on-surface-variant">health score</p>
                      </div>
                      <div className="flex gap-lg font-mono text-[10px] text-on-surface-variant">
                        <div className="text-center">
                          <p className="text-body-sm font-semibold text-on-surface">{health.completionPct}%</p>
                          <p>done</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-body-sm font-semibold ${health.blockedTasks > 0 ? "text-error" : "text-on-surface"}`}>{health.blockedTasks}</p>
                          <p>blocked</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-body-sm font-semibold ${health.overdueTasks > 0 ? "text-error" : "text-on-surface"}`}>{health.overdueTasks}</p>
                          <p>overdue</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-md">
                      <Link href="/app/analytics" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">View Analytics →</Link>
                    </div>
                  </div>
                )}

                {/* Integrations */}
                {integrationCount > 0 && (
                  <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                    <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Integrations</h2>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-[24px] font-bold leading-none text-on-surface">{integrationCount}</p>
                        <p className="mt-xs font-mono text-[10px] text-on-surface-variant">connected</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-[24px] font-bold leading-none ${integrationErrors > 0 ? "text-error" : "text-on-surface"}`}>{integrationErrors}</p>
                        <p className="mt-xs font-mono text-[10px] text-on-surface-variant">errors</p>
                      </div>
                    </div>
                    <div className="mt-md">
                      <Link href="/app/integrations" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">View Integrations →</Link>
                    </div>
                  </div>
                )}

                {/* Automation */}
                {autoRuleCount > 0 && (
                  <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                    <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Automation</h2>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-[24px] font-bold leading-none text-on-surface">{autoRuleCount}</p>
                        <p className="mt-xs font-mono text-[10px] text-on-surface-variant">active rules</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-[24px] font-bold leading-none ${autoFailedRuns > 0 ? "text-error" : "text-on-surface"}`}>{autoFailedRuns}</p>
                        <p className="mt-xs font-mono text-[10px] text-on-surface-variant">failed</p>
                      </div>
                    </div>
                    <div className="mt-md">
                      <Link href="/app/automation" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">View Automation →</Link>
                    </div>
                  </div>
                )}

                {/* Platform Status (owner only) */}
                {isOwner && (
                  <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                    <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Platform Status</h2>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-[24px] font-bold leading-none text-on-surface">{data?.overall.pct ?? 0}%</p>
                        <p className="mt-xs font-mono text-[10px] text-on-surface-variant">health score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[24px] font-bold leading-none text-on-surface">{config.app.version}</p>
                        <p className="mt-xs font-mono text-[10px] text-on-surface-variant">version</p>
                      </div>
                      <div className="text-center">
                        <Link href="/app/admin" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">Open Admin →</Link>
                      </div>
                    </div>
                    <div className="mt-md flex items-center gap-md font-mono text-[9px] text-on-surface-variant">
                      <span>{integrationErrors > 0 ? `${integrationErrors} integration error(s)` : "Integrations OK"}</span>
                      <span>{autoFailedRuns > 0 ? `${autoFailedRuns} failed automation(s)` : "Automation OK"}</span>
                    </div>
                  </div>
                )}

                {/* Collaboration Summary */}
                <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                  <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Collaboration</h2>
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <p className={`text-[24px] font-bold leading-none ${pendingReviewCount > 0 ? "text-primary" : "text-on-surface"}`}>{pendingReviewCount}</p>
                      <p className="mt-xs font-mono text-[10px] text-on-surface-variant">pending reviews</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-[24px] font-bold leading-none ${unreadMentionCount > 0 ? "text-[#d29922]" : "text-on-surface"}`}>{unreadMentionCount}</p>
                      <p className="mt-xs font-mono text-[10px] text-on-surface-variant">mentions</p>
                    </div>
                  </div>
                  <div className="mt-sm flex flex-col gap-xs">
                    <Link href="/app/me" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">My Workspace →</Link>
                  </div>
                </div>

                {/* Archive Summary */}
                {archiveStats && (
                  <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                    <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Archive</h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[28px] font-bold leading-none text-on-surface">{archiveStats.totalArchived}</p>
                        <p className="mt-xs font-mono text-[10px] text-on-surface-variant">
                          archived workspace{archiveStats.totalArchived !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex gap-lg font-mono text-[10px] text-on-surface-variant">
                        <div className="text-center">
                          <p className="text-body-sm font-semibold text-[#d4af37]">{archiveStats.wins}</p>
                          <p>wins</p>
                        </div>
                        <div className="text-center">
                          <p className="text-body-sm font-semibold text-primary">{archiveStats.totalLessons}</p>
                          <p>lessons</p>
                        </div>
                      </div>
                    </div>
                    {recentArchive && (
                      <div className="mt-sm flex items-center gap-sm rounded bg-surface-container-high px-sm py-xs">
                        <span className="material-symbols-outlined text-[14px] text-on-surface-variant">history</span>
                        <span className="flex-1 font-mono text-[10px] text-on-surface-variant">
                          Last: {recentArchive.name}
                        </span>
                      </div>
                    )}
                    <div className="mt-md">
                      <Link href="/app/archive" className="font-mono text-[10px] text-primary transition-opacity hover:opacity-80">View Archive →</Link>
                    </div>
                  </div>
                )}

                {/* Command Palette Entry */}
                <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                  <div className="flex items-center justify-between">
                    <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Quick Search</h2>
                    <kbd className="rounded border border-outline-variant bg-black px-sm py-xs font-mono text-[9px] text-on-surface-variant">⌘K</kbd>
                  </div>
                  <div className="mt-sm rounded border border-outline-variant/30 bg-black px-md py-sm text-body-sm text-on-surface-variant/50">
                    Search anything...
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded border border-outline-variant/30 bg-surface-container-low p-lg">
                  <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Activity</h2>
                  {activity.length === 0 ? (
                    <div className="flex flex-col items-center gap-sm py-lg text-center">
                      <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30">history</span>
                      <p className="font-mono text-[10px] text-on-surface-variant">No activity yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-xs">
                      {activity.map((event) => (
                        <div key={event.id} className="flex items-start gap-sm rounded px-sm py-sm transition-colors hover:bg-surface-container-high">
                          <span className="material-symbols-outlined mt-[2px] text-[14px] text-on-surface-variant">{MODULE_ICONS[event.module] ?? "circle"}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-body-sm text-on-surface">{event.title}</p>
                            <p className="font-mono text-[9px] text-on-surface-variant">
                              {event.module} · {formatTimeAgo(event.createdAt)}
                              {event.actor && ` · by ${event.actor}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
