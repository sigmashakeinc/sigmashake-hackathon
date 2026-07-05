import { getSupabaseServerClient } from "@/services/supabase";
import type {
  WorkspaceHealth,
  PlanningAnalytics,
  TaskAnalytics,
  TeamAnalytics,
  IdeaAnalytics,
  ResearchAnalytics,
  FileAnalytics,
  RelationshipAnalytics,
  DiscoveryAnalytics,
  SubmissionAnalytics,
} from "./types";

export function createAnalyticsService() {
  function client() {
    return getSupabaseServerClient();
  }

  async function health(hackathonId: string): Promise<WorkspaceHealth> {
    const [
      tasks,
      tasksDone,
      tasksBlocked,
      tasksOverdue,
      ideas,
      research,
      submissionData,
      relationships,
      files,
      activity,
    ] = await Promise.all([
      client().from("tasks").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).not("status", "eq", "archived"),
      client().from("tasks").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).eq("status", "done"),
      client().from("tasks").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).eq("status", "blocked"),
      client().from("tasks").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).lt("due_date", new Date().toISOString()).not("status", "in", '("done","archived")'),
      client().from("ideas").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).not("status", "eq", "archived"),
      client().from("research_items").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId),
      client().from("submissions").select("id, status, submission_deliverables!inner(id, status)").eq("hackathon_id", hackathonId).maybeSingle(),
      client().from("relationships").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId),
      client().from("files").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId),
      client().from("activity_events").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId),
    ]);

    const totalTasks = tasks.count ?? 0;
    const doneTasks = tasksDone.count ?? 0;
    const blockedTasks = tasksBlocked.count ?? 0;
    const overdueTasks = tasksOverdue.count ?? 0;
    const ideasTotal = ideas.count ?? 0;
    const researchTotal = research.count ?? 0;
    const relationCount = relationships.count ?? 0;
    const fileCount = files.count ?? 0;
    const activityCount = activity.count ?? 0;

    const ideasApproved = (await client().from("ideas").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).eq("status", "approved")).count ?? 0;
    const ideasImplemented = (await client().from("ideas").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).eq("status", "implemented")).count ?? 0;
    const ideasProgress = ideasTotal > 0 ? Math.round(((ideasApproved + ideasImplemented) / ideasTotal) * 100) : 0;

    const researchVerified = (await client().from("research_items").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).eq("verification_status", "verified")).count ?? 0;
    const researchProgress = researchTotal > 0 ? Math.round((researchVerified / researchTotal) * 100) : 0;

    let submissionReadiness = 0;
    if (submissionData.data) {
      const sd = submissionData.data as { submission_deliverables: { status: string }[] };
      const deliverables = sd.submission_deliverables;
      const complete = deliverables.filter((d: { status: string }) => d.status === "complete").length;
      submissionReadiness = deliverables.length > 0 ? Math.round((complete / deliverables.length) * 100) : 0;
    }

    return {
      healthScore: Math.round(
        (doneTasks / Math.max(totalTasks, 1)) * 30 +
        (1 - blockedTasks / Math.max(totalTasks, 1)) * 20 +
        (1 - overdueTasks / Math.max(totalTasks, 1)) * 20 +
        (ideasProgress / 100) * 10 +
        (researchProgress / 100) * 10 +
        (submissionReadiness / 100) * 10
      ),
      completionPct: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      tasksCompleted: doneTasks,
      tasksTotal: totalTasks,
      blockedTasks,
      overdueTasks,
      ideasProgress,
      researchProgress,
      submissionReadiness,
      relationshipsCreated: relationCount,
      filesUploaded: fileCount,
      totalActivity: activityCount,
    };
  }

  async function planning(hackathonId: string): Promise<PlanningAnalytics> {
    const [objectives, milestones, requirements, deliverables, risks, decisions] = await Promise.all([
      client().from("objectives").select("status").eq("hackathon_id", hackathonId),
      client().from("milestones").select("status, completion_pct").eq("hackathon_id", hackathonId),
      client().from("requirements").select("status").eq("hackathon_id", hackathonId),
      client().from("deliverables").select("status").eq("hackathon_id", hackathonId),
      client().from("risks").select("status").eq("hackathon_id", hackathonId),
      client().from("decisions").select("status").eq("hackathon_id", hackathonId),
    ]);

    const objs = (objectives.data ?? []) as { status: string }[];
    const mils = (milestones.data ?? []) as { status: string; completion_pct: number | null }[];
    const reqs = (requirements.data ?? []) as { status: string }[];
    const dels = (deliverables.data ?? []) as { status: string }[];
    const riss = (risks.data ?? []) as { status: string }[];
    const decis = (decisions.data ?? []) as { status: string }[];

    return {
      totalObjectives: objs.length,
      completedObjectives: objs.filter((r) => r.status === "completed").length,
      totalMilestones: mils.length,
      completedMilestones: mils.filter((r) => r.status === "completed").length,
      avgMilestoneCompletion: mils.length > 0 ? Math.round(mils.reduce((a, r) => a + (r.completion_pct ?? 0), 0) / mils.length) : 0,
      totalRequirements: reqs.length,
      completedRequirements: reqs.filter((r) => r.status === "completed").length,
      totalDeliverables: dels.length,
      completedDeliverables: dels.filter((r) => r.status === "completed").length,
      totalRisks: riss.length,
      mitigatedRisks: riss.filter((r) => r.status === "mitigated" || r.status === "resolved").length,
      totalDecisions: decis.length,
      acceptedDecisions: decis.filter((r) => r.status === "accepted").length,
    };
  }

  async function tasks(hackathonId: string): Promise<TaskAnalytics> {
    const [statusData, hoursData, overdueData] = await Promise.all([
      client().from("tasks").select("status").eq("hackathon_id", hackathonId).not("status", "eq", "archived"),
      client().from("tasks").select("actual_hours, created_at, completed_date").eq("hackathon_id", hackathonId).eq("status", "done").not("actual_hours", "is", null),
      client().from("tasks").select("due_date").eq("hackathon_id", hackathonId).lt("due_date", new Date().toISOString()).not("status", "in", '("done","archived")'),
    ]);

    const statusRows = (statusData.data ?? []) as { status: string }[];
    const byStatus: Record<string, number> = {};
    for (const row of statusRows) {
      byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    }

    const hoursRows = (hoursData.data ?? []) as { actual_hours: number | null; created_at: string; completed_date: string | null }[];
    const avgHours = hoursRows.length > 0
      ? Math.round(hoursRows.reduce((a, r) => a + (r.actual_hours ?? 0), 0) / hoursRows.length * 10) / 10
      : 0;

    const now = new Date();
    const trendDays = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().slice(0, 10);
    });

    const completionTrend = trendDays.map((date) => ({
      date,
      count: (statusData.data ?? []).filter((r: { status: string }) => {
        const task = r as { status: string; completed_date?: string };
        return task.status === "done" && task.completed_date?.startsWith(date);
      }).length,
    }));

    const overdueTrend = trendDays.map((date) => ({
      date,
      count: (overdueData.data ?? []).filter(() => true).length,
    }));

    return {
      byStatus,
      total: statusRows.length,
      avgCompletionHours: avgHours,
      overdueCount: overdueData.count ?? 0,
      avgDifficulty: 0,
      completionTrend,
      overdueTrend,
    };
  }

  async function team(hackathonId: string): Promise<TeamAnalytics> {
    const [members, tasksData, activityData] = await Promise.all([
      client().from("team_members").select("profile_id, profiles!inner(id, display_name)").eq("hackathon_id", hackathonId).is("deactivated_at", null),
      client().from("tasks").select("owner, status").eq("hackathon_id", hackathonId).not("owner", "is", null).not("status", "eq", "archived"),
      client().from("activity_events").select("actor").eq("hackathon_id", hackathonId).not("actor", "is", null),
    ]);

    const memberRows = (members.data ?? []) as { profile_id: string; profiles: { display_name: string } }[];
    const taskRows = (tasksData.data ?? []) as { owner: string; status: string }[];

    const memberWorkload = memberRows.map((m) => ({
      name: m.profiles.display_name,
      assigned: taskRows.filter((t) => t.owner === m.profiles.display_name).length,
      completed: taskRows.filter((t) => t.owner === m.profiles.display_name && t.status === "done").length,
    }));

    const activityRows = (activityData.data ?? []) as { actor: string }[];
    const activityByMemberMap: Record<string, number> = {};
    for (const row of activityRows) {
      activityByMemberMap[row.actor] = (activityByMemberMap[row.actor] ?? 0) + 1;
    }
    const activityByMember = Object.entries(activityByMemberMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    return {
      memberWorkload,
      totalAssigned: taskRows.length,
      totalCompleted: taskRows.filter((t) => t.status === "done").length,
      totalReviews: 0,
      activityByMember,
    };
  }

  async function ideas(hackathonId: string): Promise<IdeaAnalytics> {
    const allIdeas = await client()
      .from("ideas")
      .select("id, title, status, vote_count")
      .eq("hackathon_id", hackathonId);

    const ideaRows = (allIdeas.data ?? []) as { id: string; title: string; status: string; vote_count: number }[];
    const ideaIds = ideaRows.map((r) => r.id);

    let voteRows: { created_at: string }[] = [];
    if (ideaIds.length > 0) {
      const votesData = await client()
        .from("idea_votes")
        .select("created_at")
        .in("idea_id", ideaIds);
      voteRows = (votesData.data ?? []) as { created_at: string }[];
    }

    const approved = ideaRows.filter((r) => r.status === "approved").length;
    const rejected = ideaRows.filter((r) => r.status === "rejected").length;
    const implemented = ideaRows.filter((r) => r.status === "implemented").length;
    const totalVotes = ideaRows.reduce((a, r) => a + (r.vote_count ?? 0), 0);

    const popular = [...ideaRows].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)).slice(0, 5).map((r) => ({ title: r.title, votes: r.vote_count ?? 0 }));

    const now = new Date();
    const votingTrend = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().slice(0, 10);
      return { date: dateStr, count: voteRows.filter((v) => v.created_at.startsWith(dateStr)).length };
    });

    return {
      total: ideaRows.length,
      approved,
      rejected,
      implemented,
      totalVotes,
      popular,
      votingTrend,
    };
  }

  async function research(hackathonId: string): Promise<ResearchAnalytics> {
    const [itemsData, refData] = await Promise.all([
      client().from("research_items").select("title, category, verification_status").eq("hackathon_id", hackathonId),
      client().from("relationships").select("target_id").eq("hackathon_id", hackathonId).eq("source_module", "research"),
    ]);

    const rows = (itemsData.data ?? []) as { title: string; category: string; verification_status: string }[];
    const refRows = (refData.data ?? []) as { target_id: string }[];

    const byCategory: Record<string, number> = {};
    for (const r of rows) {
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    }

    const refCount: Record<string, number> = {};
    for (const r of refRows) {
      refCount[r.target_id] = (refCount[r.target_id] ?? 0) + 1;
    }
    const mostReferenced = Object.entries(refCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => {
        const item = rows.find((r) => r.title === id);
        return { title: item?.title ?? id, references: count };
      });

    return {
      total: rows.length,
      verified: rows.filter((r) => r.verification_status === "verified").length,
      deprecated: rows.filter((r) => r.verification_status === "deprecated").length,
      byCategory,
      mostReferenced,
    };
  }

  async function files(hackathonId: string): Promise<FileAnalytics> {
    const filesData = await client()
      .from("files")
      .select("name, category, file_size")
      .eq("hackathon_id", hackathonId);

    const rows = (filesData.data ?? []) as { name: string; category: string; file_size: number }[];
    const totalSize = rows.reduce((a, r) => a + (r.file_size ?? 0), 0);

    const byCategory: Record<string, number> = {};
    for (const r of rows) {
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    }

    const largest = [...rows].sort((a, b) => (b.file_size ?? 0) - (a.file_size ?? 0)).slice(0, 5).map((r) => ({ name: r.name, size: r.file_size ?? 0 }));

    return { totalSize, totalFiles: rows.length, byCategory, largest };
  }

  async function relationships(hackathonId: string): Promise<RelationshipAnalytics> {
    const relData = await client()
      .from("relationships")
      .select("relationship_type, source_module, source_id")
      .eq("hackathon_id", hackathonId);

    const rows = (relData.data ?? []) as { relationship_type: string; source_module: string; source_id: string }[];
    const byType: Record<string, number> = {};

    const connectedCount: Record<string, number> = {};
    for (const r of rows) {
      const key = `${r.source_module}:${r.source_id}`;
      connectedCount[key] = (connectedCount[key] ?? 0) + 1;
    }
    const mostConnected: { label: string; count: number }[] = Object.entries(connectedCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => ({ label: key.split(":")[0] ?? "", count }));

    return {
      total: rows.length,
      byType,
      mostConnected,
      orphaned: rows.length - new Set(rows.map((r) => `${r.source_module}:${r.source_id}`)).size,
    };
  }

  async function discovery(_hackathonId: string): Promise<DiscoveryAnalytics> {
    const pipelineData = await client()
      .from("event_pipeline")
      .select("status");

    const rows = (pipelineData.data ?? []) as { status: string }[];

    return {
      watching: rows.filter((r) => r.status === "watching" || r.status === "interested").length,
      applied: rows.filter((r) => r.status === "applied").length,
      accepted: rows.filter((r) => r.status === "accepted").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
      upcoming: rows.filter((r) => r.status === "discovered" || r.status === "watching").length,
    };
  }

  async function submission(hackathonId: string): Promise<SubmissionAnalytics> {
    const subData = await client()
      .from("submissions")
      .select("id, submission_deliverables!inner(id, status)")
      .eq("hackathon_id", hackathonId)
      .maybeSingle();

    if (!subData.data) {
      return { deliverablesTotal: 0, deliverablesComplete: 0, checklistTotal: 0, checklistComplete: 0, readinessPct: 0, remainingWork: 0 };
    }

    const sd = subData.data as { id: string; submission_deliverables: { id: string; status: string }[] };
    const deliverables = sd.submission_deliverables;
    const deliverablesTotal = deliverables.length;
    const deliverablesComplete = deliverables.filter((d) => d.status === "complete").length;
    const readinessPct = deliverablesTotal > 0 ? Math.round((deliverablesComplete / deliverablesTotal) * 100) : 0;

    const checklistData = await client()
      .from("submission_checklist")
      .select("id, checked, not_required")
      .eq("submission_id", sd.id);

    const checklistRows = (checklistData.data ?? []) as { id: string; checked: boolean; not_required: boolean }[];
    const checklistTotal = checklistRows.filter((r) => !r.not_required).length;
    const checklistComplete = checklistRows.filter((r) => r.checked).length;

    return {
      deliverablesTotal,
      deliverablesComplete,
      checklistTotal,
      checklistComplete,
      readinessPct,
      remainingWork: (deliverablesTotal - deliverablesComplete) + (checklistTotal - checklistComplete),
    };
  }

  return { health, planning, tasks, team, ideas, research, files, relationships, discovery, submission };
}
