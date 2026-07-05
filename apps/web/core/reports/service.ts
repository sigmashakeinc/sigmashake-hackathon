import { getSupabaseServerClient } from "@/services/supabase";
import { createAnalyticsService } from "@/core/analytics";
import { REPORT_LABELS, type Report, type ReportType, type ReportSection } from "./types";

export function createReportService() {
  function client() {
    return getSupabaseServerClient();
  }

  function generate(
    hackathonId: string,
    reportType: ReportType,
    generatedBy: string
  ): Promise<Report> {
    const analytics = createAnalyticsService();

    const common = {
      id: crypto.randomUUID(),
      hackathonId,
      reportType,
      title: REPORT_LABELS[reportType],
      generatedAt: new Date().toISOString(),
      generatedBy,
    };

    switch (reportType) {
      case "executive_summary":
        return generateExecutiveSummary(common, hackathonId, analytics);
      case "planning":
        return generatePlanningReport(common, hackathonId, analytics);
      case "tasks":
        return generateTaskReport(common, hackathonId, analytics);
      case "submission":
        return generateSubmissionReport(common, hackathonId, analytics);
      case "team":
        return generateTeamReport(common, hackathonId, analytics);
      case "discovery":
        return generateDiscoveryReport(common, hackathonId, analytics);
      case "workspace_health":
        return generateHealthReport(common, hackathonId, analytics);
    }
  }

  async function exportReport(
    hackathonId: string,
    report: Report,
    format: "csv" | "json",
    userId: string
  ): Promise<{ url: string }> {
    const { createObjectURL } = URL;

    let blob: Blob;

    if (format === "json") {
      const json = JSON.stringify(report, null, 2);
      blob = new Blob([json], { type: "application/json" });
    } else {
      const csv = reportToCsv(report);
      blob = new Blob([csv], { type: "text/csv" });
    }

    const url = createObjectURL(blob);

    // Persist export record via raw query
    const { error } = await client().from("report_exports").insert({
      hackathon_id: hackathonId,
      report_type: report.reportType,
      format,
      data: report,
      status: "completed",
      created_by: userId,
    } as never) as unknown as { error: unknown };

    void error;

    return { url };
  }

  async function listExports(hackathonId: string) {
    const { data } = await (client().from("report_exports").select("*").eq("hackathon_id", hackathonId).order("created_at", { ascending: false }).limit(20) as never) as { data: Record<string, unknown>[] | null };

    return (data ?? []).map(mapExportRow);
  }

  return { generate, exportReport, listExports };
}

function mapExportRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    hackathonId: row.hackathon_id as string,
    reportType: row.report_type as ReportType,
    format: row.format as "csv" | "pdf" | "json",
    data: row.data as Record<string, unknown>,
    fileUrl: row.file_url as string | null,
    status: row.status as string,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
  };
}

function reportToCsv(report: Report): string {
  const lines: string[] = ["Report,Section,Metric,Value"];
  for (const section of report.sections) {
    lines.push(`"${report.title}","${section.title}","summary","${section.content.slice(0, 200)}"`);
    for (const [key, value] of Object.entries(section.metrics)) {
      lines.push(`"${report.title}","${section.title}","${key}","${String(value)}"`);
    }
  }
  return lines.join("\n");
}

async function generateExecutiveSummary(
  common: Omit<Report, "summary" | "sections">,
  hackathonId: string,
  analytics: ReturnType<typeof createAnalyticsService>
): Promise<Report> {
  const [h, p, t, i, r, _f, s] = await Promise.all([
    analytics.health(hackathonId),
    analytics.planning(hackathonId),
    analytics.tasks(hackathonId),
    analytics.ideas(hackathonId),
    analytics.research(hackathonId),
    analytics.files(hackathonId),
    analytics.submission(hackathonId),
  ]);

  const sections: ReportSection[] = [
    {
      title: "Workspace Health",
      content: `Health score: ${h.healthScore}/100. ${h.completionPct}% of tasks complete. ${h.blockedTasks} blocked, ${h.overdueTasks} overdue.`,
      metrics: h as unknown as Record<string, unknown>,
    },
    {
      title: "Planning",
      content: `${p.completedObjectives}/${p.totalObjectives} objectives, ${p.completedMilestones}/${p.totalMilestones} milestones.`,
      metrics: p as unknown as Record<string, unknown>,
    },
    {
      title: "Tasks",
      content: `${t.total} tasks. ${t.byStatus.done ?? 0} done, ${t.byStatus.blocked ?? 0} blocked. Avg ${t.avgCompletionHours}h completion.`,
      metrics: t as unknown as Record<string, unknown>,
    },
    {
      title: "Ideas & Research",
      content: `${i.total} ideas (${i.approved} approved, ${i.implemented} implemented). ${r.total} research items.`,
      metrics: { ideas: i, research: r } as unknown as Record<string, unknown>,
    },
    {
      title: "Submission Readiness",
      content: `${s.readinessPct}% ready. ${s.remainingWork} items remaining.`,
      metrics: s as unknown as Record<string, unknown>,
    },
  ];

  const status = s.readinessPct >= 80 ? "on track" : s.readinessPct >= 50 ? "needs attention" : "behind schedule";

  return {
    ...common,
    summary: `Workspace health: ${h.healthScore}/100. Submission is ${s.readinessPct}% ready — ${status}. ${h.blockedTasks} blockers to resolve.`,
    sections,
  };
}

async function generatePlanningReport(
  common: Omit<Report, "summary" | "sections">,
  hackathonId: string,
  analytics: ReturnType<typeof createAnalyticsService>
): Promise<Report> {
  const p = await analytics.planning(hackathonId);

  return {
    ...common,
    summary: `${p.completedObjectives}/${p.totalObjectives} objectives complete. ${p.avgMilestoneCompletion}% milestone progress. ${p.totalRisks} risks identified.`,
    sections: [
      { title: "Objectives", content: `${p.completedObjectives}/${p.totalObjectives} completed.`, metrics: { total: p.totalObjectives, completed: p.completedObjectives } },
      { title: "Milestones", content: `${p.completedMilestones}/${p.totalMilestones} completed. Average progress: ${p.avgMilestoneCompletion}%.`, metrics: { total: p.totalMilestones, completed: p.completedMilestones, avgCompletion: p.avgMilestoneCompletion } },
      { title: "Requirements", content: `${p.completedRequirements}/${p.totalRequirements} completed.`, metrics: { total: p.totalRequirements, completed: p.completedRequirements } },
      { title: "Deliverables", content: `${p.completedDeliverables}/${p.totalDeliverables} completed.`, metrics: { total: p.totalDeliverables, completed: p.completedDeliverables } },
      { title: "Risks", content: `${p.mitigatedRisks}/${p.totalRisks} mitigated or resolved.`, metrics: { total: p.totalRisks, mitigated: p.mitigatedRisks } },
      { title: "Decisions", content: `${p.acceptedDecisions}/${p.totalDecisions} accepted.`, metrics: { total: p.totalDecisions, accepted: p.acceptedDecisions } },
    ],
  };
}

async function generateTaskReport(
  common: Omit<Report, "summary" | "sections">,
  hackathonId: string,
  analytics: ReturnType<typeof createAnalyticsService>
): Promise<Report> {
  const t = await analytics.tasks(hackathonId);

  return {
    ...common,
    summary: `${t.total} tasks. ${t.byStatus.done ?? 0} done. ${t.overdueCount} overdue. Avg ${t.avgCompletionHours}h completion time.`,
    sections: [
      { title: "Status Breakdown", content: JSON.stringify(t.byStatus), metrics: t.byStatus as unknown as Record<string, unknown> },
      { title: "Completion Time", content: `Average: ${t.avgCompletionHours} hours.`, metrics: { avgHours: t.avgCompletionHours } },
      { title: "Overdue", content: `${t.overdueCount} tasks overdue.`, metrics: { overdue: t.overdueCount } },
    ],
  };
}

async function generateSubmissionReport(
  common: Omit<Report, "summary" | "sections">,
  hackathonId: string,
  analytics: ReturnType<typeof createAnalyticsService>
): Promise<Report> {
  const s = await analytics.submission(hackathonId);

  return {
    ...common,
    summary: `Submission is ${s.readinessPct}% ready. ${s.remainingWork} items remaining. ${s.deliverablesComplete}/${s.deliverablesTotal} deliverables complete.`,
    sections: [
      { title: "Readiness", content: `${s.readinessPct}% complete.`, metrics: { readinessPct: s.readinessPct } },
      { title: "Deliverables", content: `${s.deliverablesComplete}/${s.deliverablesTotal} complete.`, metrics: { total: s.deliverablesTotal, complete: s.deliverablesComplete } },
      { title: "Checklist", content: `${s.checklistComplete}/${s.checklistTotal} items checked.`, metrics: { total: s.checklistTotal, complete: s.checklistComplete } },
      { title: "Remaining Work", content: `${s.remainingWork} items to complete.`, metrics: { remaining: s.remainingWork } },
    ],
  };
}

async function generateTeamReport(
  common: Omit<Report, "summary" | "sections">,
  hackathonId: string,
  analytics: ReturnType<typeof createAnalyticsService>
): Promise<Report> {
  const tm = await analytics.team(hackathonId);

  return {
    ...common,
    summary: `${tm.memberWorkload.length} members. ${tm.totalCompleted}/${tm.totalAssigned} tasks completed.`,
    sections: [
      { title: "Workload", content: `Members: ${tm.memberWorkload.length}. Total tasks: ${tm.totalAssigned}.`, metrics: { members: tm.memberWorkload.length, assigned: tm.totalAssigned, completed: tm.totalCompleted } },
      { title: "Activity", content: `${tm.activityByMember.length} members active.`, metrics: { activeMembers: tm.activityByMember.length } },
    ],
  };
}

async function generateDiscoveryReport(
  common: Omit<Report, "summary" | "sections">,
  hackathonId: string,
  analytics: ReturnType<typeof createAnalyticsService>
): Promise<Report> {
  const d = await analytics.discovery(hackathonId);

  return {
    ...common,
    summary: `${d.watching} watching, ${d.applied} applied, ${d.accepted} accepted.`,
    sections: [
      { title: "Pipeline", content: `Watching: ${d.watching}. Applied: ${d.applied}. Accepted: ${d.accepted}.`, metrics: d as unknown as Record<string, unknown> },
    ],
  };
}

async function generateHealthReport(
  common: Omit<Report, "summary" | "sections">,
  hackathonId: string,
  analytics: ReturnType<typeof createAnalyticsService>
): Promise<Report> {
  const h = await analytics.health(hackathonId);

  const areas: string[] = [];
  if (h.blockedTasks > 0) areas.push(`${h.blockedTasks} blocked tasks`);
  if (h.overdueTasks > 0) areas.push(`${h.overdueTasks} overdue tasks`);
  if (h.submissionReadiness < 50) areas.push("submission readiness below 50%");

  return {
    ...common,
    summary: `Health: ${h.healthScore}/100. ${areas.length > 0 ? `Needs attention: ${areas.join(", ")}.` : "All areas on track."}`,
    sections: [
      { title: "Health Score", content: `${h.healthScore}/100`, metrics: { score: h.healthScore } },
      { title: "Completion", content: `${h.completionPct}% of tasks done.`, metrics: { completionPct: h.completionPct } },
      { title: "Blockers", content: `${h.blockedTasks} blocked, ${h.overdueTasks} overdue.`, metrics: { blocked: h.blockedTasks, overdue: h.overdueTasks } },
      { title: "Submission", content: `${h.submissionReadiness}% ready.`, metrics: { readiness: h.submissionReadiness } },
    ],
  };
}
