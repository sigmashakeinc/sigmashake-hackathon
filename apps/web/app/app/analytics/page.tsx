"use client";

import { useState, useEffect, useCallback } from "react";
import { useHackathon } from "@/core/hackathon";
import { createAnalyticsService, type WorkspaceHealth, type PlanningAnalytics, type TaskAnalytics, type TeamAnalytics, type IdeaAnalytics, type ResearchAnalytics, type FileAnalytics, type RelationshipAnalytics, type DiscoveryAnalytics, type SubmissionAnalytics } from "@/core/analytics";
import { createReportService, REPORT_LABELS, type ReportType, type ExportFormat } from "@/core/reports";
import { MetricCard, DonutChart, ProgressSection, TrendChart, BarChart, StatusBar, STATUS_COLORS, ContributionChart, ReportCard, ExportDialog } from "@/components/analytics";

type Section = "overview" | "productivity" | "planning" | "execution" | "submission" | "team" | "discovery" | "history" | "reports";

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "productivity", label: "Productivity", icon: "speed" },
  { id: "planning", label: "Planning", icon: "map" },
  { id: "execution", label: "Execution", icon: "code" },
  { id: "submission", label: "Submission Readiness", icon: "task_alt" },
  { id: "team", label: "Team", icon: "group" },
  { id: "discovery", label: "Discovery", icon: "travel_explore" },
  { id: "history", label: "History", icon: "history" },
  { id: "reports", label: "Reports", icon: "description" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

export default function AnalyticsPage() {
  const { activeHackathon } = useHackathon();
  const hackathonId = activeHackathon?.id;
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generating, setGenerating] = useState<ReportType | null>(null);
  const [reportContent, setReportContent] = useState<string | null>(null);

  const [health, setHealth] = useState<WorkspaceHealth | null>(null);
  const [planning, setPlanning] = useState<PlanningAnalytics | null>(null);
  const [taskData, setTaskData] = useState<TaskAnalytics | null>(null);
  const [teamData, setTeamData] = useState<TeamAnalytics | null>(null);
  const [ideaData, setIdeaData] = useState<IdeaAnalytics | null>(null);
  const [researchData, setResearchData] = useState<ResearchAnalytics | null>(null);
  const [fileData, setFileData] = useState<FileAnalytics | null>(null);
  const [relData, setRelData] = useState<RelationshipAnalytics | null>(null);
  const [discData, setDiscData] = useState<DiscoveryAnalytics | null>(null);
  const [subData, setSubData] = useState<SubmissionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!hackathonId) return;
    setLoading(true);
    const analytics = createAnalyticsService();
    const [h, p, t, tm, i, r, f, rel, d, s] = await Promise.all([
      analytics.health(hackathonId),
      analytics.planning(hackathonId),
      analytics.tasks(hackathonId),
      analytics.team(hackathonId),
      analytics.ideas(hackathonId),
      analytics.research(hackathonId),
      analytics.files(hackathonId),
      analytics.relationships(hackathonId),
      analytics.discovery(hackathonId),
      analytics.submission(hackathonId),
    ]);
    setHealth(h);
    setPlanning(p);
    setTaskData(t);
    setTeamData(tm);
    setIdeaData(i);
    setResearchData(r);
    setFileData(f);
    setRelData(rel);
    setDiscData(d);
    setSubData(s);
    setLoading(false);
  }, [hackathonId]);

  useEffect(() => { load(); }, [load]);

  async function handleGenerateReport(type: ReportType) {
    if (!hackathonId) return;
    setGenerating(type);
    setReportType(type);
    setReportContent(null);

    const reports = createReportService();
    const report = await reports.generate(hackathonId, type, "analytics");

    setReportContent(
      `## ${report.title}\n\n${report.summary}\n\n` +
      report.sections.map((s) => `### ${s.title}\n\n${s.content}`).join("\n\n")
    );
    setGenerating(null);
  }

  async function handleExport(format: ExportFormat) {
    if (!hackathonId || !reportType) return;
    setIsExporting(true);
    const reports = createReportService();
    const report = await reports.generate(hackathonId, reportType, "analytics");
    const result = await reports.exportReport(hackathonId, report, format as "csv" | "json", "system");
    setIsExporting(false);
    setShowExport(false);
    window.open(result.url, "_blank");
  }

  if (!hackathonId) {
    return (
      <div className="flex items-center justify-center p-lg">
        <p className="text-body-sm text-on-surface-variant">Select a hackathon to view analytics.</p>
      </div>
    );
  }

  if (loading || !health) {
    return (
      <div className="flex items-center justify-center p-lg">
        <div className="flex items-center gap-sm">
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-lg p-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">Analytics</h1>
          <p className="text-body-sm text-on-surface-variant">
            Health score: {health.healthScore}/100 &middot; {health.completionPct}% complete
          </p>
        </div>
      </div>

      <nav className="flex flex-wrap gap-xs" aria-label="Analytics sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-xs rounded px-sm py-xs text-body-xs font-medium transition-all ${
              activeSection === s.id
                ? "bg-primary text-on-primary"
                : "border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60 hover:text-on-surface"
            }`}
            aria-current={activeSection === s.id ? "page" : undefined}
          >
            <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </nav>

      {activeSection === "overview" && (
        <section aria-label="Overview">
          <div className="mb-md grid grid-cols-2 gap-sm md:grid-cols-4">
            <MetricCard label="Health Score" value={`${health.healthScore}/100`} subtitle={`${health.completionPct}% tasks complete`} icon="monitor_heart" />
            <MetricCard label="Completion" value={`${health.completionPct}%`} subtitle={`${health.tasksCompleted}/${health.tasksTotal} tasks`} icon="check_circle" />
            <MetricCard label="Blocked" value={health.blockedTasks} subtitle="Requires attention" trend={health.blockedTasks > 0 ? "down" : "neutral"} icon="block" />
            <MetricCard label="Overdue" value={health.overdueTasks} subtitle="Past deadline" trend={health.overdueTasks > 0 ? "down" : "neutral"} icon="warning" />
            <MetricCard label="Ideas Progress" value={`${health.ideasProgress}%`} icon="lightbulb" />
            <MetricCard label="Research Progress" value={`${health.researchProgress}%`} icon="science" />
            <MetricCard label="Submission Readiness" value={`${health.submissionReadiness}%`} icon="task_alt" />
            <MetricCard label="Files" value={health.filesUploaded} subtitle="Uploaded" icon="folder" />
          </div>
          <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Workspace Health Breakdown</h3>
              <ProgressSection
                title="Progress"
                items={[
                  { label: "Tasks Complete", value: health.tasksCompleted, max: Math.max(health.tasksTotal, 1) },
                  { label: "Ideas", value: health.ideasProgress, max: 100 },
                  { label: "Research", value: health.researchProgress, max: 100 },
                  { label: "Submission", value: health.submissionReadiness, max: 100 },
                ]}
              />
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Activity Summary</h3>
              <div className="flex items-center justify-around">
                <DonutChart value={health.tasksCompleted} max={Math.max(health.tasksTotal, 1)} label="Tasks Done" />
                <DonutChart value={health.submissionReadiness} max={100} label="Submission" />
                <DonutChart value={health.ideasProgress} max={100} label="Ideas" />
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === "productivity" && (
        <section aria-label="Productivity">
          <div className="mb-md grid grid-cols-2 gap-sm md:grid-cols-4">
            <MetricCard label="Tasks Completed" value={taskData?.byStatus.done ?? 0} icon="check_circle" />
            <MetricCard label="In Progress" value={taskData?.byStatus.in_progress ?? 0} icon="progress_activity" />
            <MetricCard label="Avg Completion" value={formatHours(taskData?.avgCompletionHours ?? 0)} icon="timer" />
            <MetricCard label="Ideas Implemented" value={ideaData?.implemented ?? 0} icon="lightbulb" />
          </div>
          <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Completion Trend (14 days)</h3>
              <TrendChart data={taskData?.completionTrend ?? []} height={80} />
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tasks by Status</h3>
              <StatusBar
                data={Object.entries(taskData?.byStatus ?? {}).map(([status, count]) => ({
                  label: status,
                  count,
                  color: STATUS_COLORS[status] ?? "var(--color-surface-variant)",
                }))}
              />
            </div>
          </div>
        </section>
      )}

      {activeSection === "planning" && (
        <section aria-label="Planning">
          <div className="mb-md grid grid-cols-2 gap-sm md:grid-cols-4">
            <MetricCard label="Objectives" value={`${planning?.completedObjectives ?? 0}/${(planning?.totalObjectives ?? 0)}`} icon="flag" />
            <MetricCard label="Milestones" value={`${planning?.completedMilestones ?? 0}/${(planning?.totalMilestones ?? 0)}`} icon="flag" />
            <MetricCard label="Requirements" value={`${planning?.completedRequirements ?? 0}/${(planning?.totalRequirements ?? 0)}`} icon="checklist" />
            <MetricCard label="Risks" value={`${planning?.mitigatedRisks ?? 0}/${(planning?.totalRisks ?? 0)}`} icon="gpp_maybe" />
          </div>
          <div className="grid grid-cols-1 gap-sm md:grid-cols-3">
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <ProgressSection
                title="Progress"
                items={[
                  { label: "Objectives", value: planning?.completedObjectives ?? 0, max: Math.max(planning?.totalObjectives ?? 1, 1) },
                  { label: "Milestones", value: planning?.completedMilestones ?? 0, max: Math.max(planning?.totalMilestones ?? 1, 1) },
                  { label: "Requirements", value: planning?.completedRequirements ?? 0, max: Math.max(planning?.totalRequirements ?? 1, 1) },
                  { label: "Deliverables", value: planning?.completedDeliverables ?? 0, max: Math.max(planning?.totalDeliverables ?? 1, 1) },
                ]}
              />
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <ProgressSection
                title="Health"
                items={[
                  { label: "Decisions Accepted", value: planning?.acceptedDecisions ?? 0, max: Math.max(planning?.totalDecisions ?? 1, 1) },
                  { label: "Risks Mitigated", value: planning?.mitigatedRisks ?? 0, max: Math.max(planning?.totalRisks ?? 1, 1) },
                ]}
              />
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Milestone Completion</h3>
              <div className="flex items-center justify-center">
                <DonutChart value={planning?.avgMilestoneCompletion ?? 0} max={100} label="Avg Progress" size={100} />
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === "execution" && (
        <section aria-label="Execution">
          <div className="mb-md grid grid-cols-2 gap-sm md:grid-cols-4">
            <MetricCard label="Total Tasks" value={taskData?.total ?? 0} icon="checklist" />
            <MetricCard label="Done" value={taskData?.byStatus.done ?? 0} icon="check_circle" />
            <MetricCard label="Blocked" value={taskData?.byStatus.blocked ?? 0} trend={taskData && (taskData.byStatus.blocked ?? 0) > 0 ? "down" : "neutral"} icon="block" />
            <MetricCard label="Overdue" value={taskData?.overdueCount ?? 0} trend={taskData && (taskData.overdueCount ?? 0) > 0 ? "down" : "neutral"} icon="warning" />
          </div>
          <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Task Status Distribution</h3>
              <BarChart
                data={Object.entries(taskData?.byStatus ?? {}).map(([status, count]) => ({ label: status, value: count }))}
                height={160}
              />
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Overdue Trend</h3>
              <TrendChart data={taskData?.overdueTrend ?? []} height={80} color="var(--color-error)" />
            </div>
          </div>
          <div className="mt-sm grid grid-cols-1 gap-sm md:grid-cols-3">
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <ProgressSection
                title="Ideas Pipeline"
                items={[
                  { label: "Approved", value: ideaData?.approved ?? 0, max: Math.max(ideaData?.total ?? 1, 1) },
                  { label: "Implemented", value: ideaData?.implemented ?? 0, max: Math.max(ideaData?.total ?? 1, 1) },
                ]}
              />
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <ProgressSection
                title="Research Status"
                items={[
                  { label: "Verified", value: researchData?.verified ?? 0, max: Math.max(researchData?.total ?? 1, 1) },
                  { label: "Deprecated", value: researchData?.deprecated ?? 0, max: Math.max(researchData?.total ?? 1, 1) },
                ]}
              />
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ideas Voting Trend</h3>
              <TrendChart data={ideaData?.votingTrend ?? []} height={60} />
            </div>
          </div>
        </section>
      )}

      {activeSection === "submission" && (
        <section aria-label="Submission Readiness">
          <div className="mb-md grid grid-cols-2 gap-sm md:grid-cols-4">
            <MetricCard label="Readiness" value={`${subData?.readinessPct ?? 0}%`} icon="task_alt" trend={subData && subData.readinessPct >= 80 ? "up" : subData && subData.readinessPct >= 50 ? "neutral" : "down"} />
            <MetricCard label="Deliverables" value={`${subData?.deliverablesComplete ?? 0}/${subData?.deliverablesTotal ?? 0}`} icon="checklist" />
            <MetricCard label="Checklist" value={`${subData?.checklistComplete ?? 0}/${subData?.checklistTotal ?? 0}`} icon="playlist_add_check" />
            <MetricCard label="Remaining" value={subData?.remainingWork ?? 0} icon="pending" />
          </div>
          <div className="grid grid-cols-1 gap-sm md:grid-cols-3">
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Overall Readiness</h3>
              <div className="flex items-center justify-center">
                <DonutChart value={subData?.readinessPct ?? 0} max={100} label="Ready" size={120} />
              </div>
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <ProgressSection
                title="Deliverables"
                items={[
                  { label: "Complete", value: subData?.deliverablesComplete ?? 0, max: Math.max(subData?.deliverablesTotal ?? 1, 1) },
                  { label: "Checklist", value: subData?.checklistComplete ?? 0, max: Math.max(subData?.checklistTotal ?? 1, 1) },
                ]}
              />
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <div className="flex h-full flex-col justify-center">
                <p className="text-body-sm text-on-surface-variant">
                  {subData && subData.readinessPct >= 80
                    ? "Your submission is well prepared. Review remaining items and finalise."
                    : subData && subData.readinessPct >= 50
                    ? "Your submission needs attention. Focus on completing outstanding deliverables."
                    : "Your submission is not ready. Prioritise submission preparation."}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === "team" && (
        <section aria-label="Team">
          <div className="mb-md grid grid-cols-2 gap-sm md:grid-cols-4">
            <MetricCard label="Members" value={teamData?.memberWorkload.length ?? 0} icon="group" />
            <MetricCard label="Assigned Tasks" value={teamData?.totalAssigned ?? 0} icon="assignment" />
            <MetricCard label="Completed" value={teamData?.totalCompleted ?? 0} icon="check_circle" />
            <MetricCard label="Active Members" value={teamData?.activityByMember.length ?? 0} icon="person" />
          </div>
          <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Member Workload</h3>
              <ContributionChart data={teamData?.memberWorkload ?? []} />
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Member Activity</h3>
              <BarChart
                data={(teamData?.activityByMember ?? []).map((m) => ({ label: m.name, value: m.count }))}
                height={160}
              />
            </div>
          </div>
        </section>
      )}

      {activeSection === "discovery" && (
        <section aria-label="Discovery">
          <div className="mb-md grid grid-cols-2 gap-sm md:grid-cols-4">
            <MetricCard label="Watching" value={discData?.watching ?? 0} icon="visibility" />
            <MetricCard label="Applied" value={discData?.applied ?? 0} icon="send" />
            <MetricCard label="Accepted" value={discData?.accepted ?? 0} icon="check_circle" />
            <MetricCard label="Upcoming" value={discData?.upcoming ?? 0} icon="event" />
          </div>
          <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
            <ProgressSection
              title="Discovery Pipeline"
              items={[
                { label: "Watching", value: discData?.watching ?? 0, max: Math.max(discData?.watching ?? 1, 1) },
                { label: "Applied", value: discData?.applied ?? 0, max: Math.max(discData?.watching ?? 1, 1) },
                { label: "Accepted", value: discData?.accepted ?? 0, max: Math.max(discData?.watching ?? 1, 1) },
              ]}
            />
          </div>
        </section>
      )}

      {activeSection === "history" && (
        <section aria-label="History">
          <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Files Overview</h3>
              <div className="mb-sm grid grid-cols-2 gap-sm">
                <MetricCard label="Total Files" value={fileData?.totalFiles ?? 0} icon="folder" />
                <MetricCard label="Total Size" value={formatBytes(fileData?.totalSize ?? 0)} icon="storage" />
              </div>
              {fileData && fileData.byCategory && Object.keys(fileData.byCategory).length > 0 && (
                <ProgressSection
                  title="By Category"
                  items={Object.entries(fileData.byCategory).map(([cat, count]) => ({
                    label: cat,
                    value: count,
                    max: Object.values(fileData.byCategory).reduce((a, b) => a + b, 0),
                  }))}
                />
              )}
            </div>
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <h3 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Relationships</h3>
              <div className="mb-sm grid grid-cols-2 gap-sm">
                <MetricCard label="Total" value={relData?.total ?? 0} icon="hub" />
                <MetricCard label="Orphaned" value={relData?.orphaned ?? 0} icon="link_off" />
              </div>
              {relData && relData.byType && Object.keys(relData.byType).length > 0 && (
                <BarChart
                  data={Object.entries(relData.byType).map(([type, count]) => ({ label: type, value: count }))}
                  height={120}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {activeSection === "reports" && (
        <section aria-label="Reports">
          <div className="mb-md grid grid-cols-1 gap-sm md:grid-cols-2">
            {Object.entries(REPORT_LABELS).map(([type, label]) => {
              const reportType = type as ReportType;
              const descriptions: Record<ReportType, string> = {
                executive_summary: "High-level overview of workspace health, progress, and risks.",
                planning: "Objectives, milestones, requirements, deliverables, risks, and decisions.",
                tasks: "Task status breakdown, completion times, and overdue trends.",
                submission: "Submission readiness, deliverable status, and remaining work.",
                team: "Member workload, task distribution, and activity levels.",
                discovery: "Hackathon discovery pipeline and application status.",
                workspace_health: "Comprehensive health score and area analysis.",
              };
              return (
                <ReportCard
                  key={type}
                  label={label}
                  description={descriptions[reportType]}
                  icon="description"
                  onGenerate={() => handleGenerateReport(reportType)}
                  disabled={generating === reportType}
                />
              );
            })}
          </div>

          {reportContent && (
            <div className="rounded border border-outline-variant/30 bg-surface-container p-md">
              <div className="mb-sm flex items-center justify-between">
                <h2 className="text-h3 font-semibold text-on-surface">
                  {reportType ? REPORT_LABELS[reportType] : ""}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowExport(true); }}
                  className="flex items-center gap-xs rounded bg-primary px-sm py-xs text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826]"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  Export
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-body-sm text-on-surface-variant">
                {reportContent}
              </pre>
            </div>
          )}

          <ExportDialog
            open={showExport}
            onClose={() => setShowExport(false)}
            onExport={handleExport}
            isExporting={isExporting}
          />
        </section>
      )}
    </div>
  );
}
