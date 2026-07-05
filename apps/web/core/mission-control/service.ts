import { createPlanningService } from "@/core/planning";
import { createIdeasService } from "@/core/ideas";
import { createResearchService } from "@/core/research";
import { createTaskService } from "@/core/tasks";
import { createSubmissionService } from "@/core/submission";
import { createProfileService } from "@/core/profile";
import { getSupabaseBrowserClient } from "@/services/supabase";

export interface MissionControlData {
  overall: { pct: number; label: string };
  planning: { pct: number; label: string };
  ideas: { pct: number; label: string };
  research: { pct: number; label: string };
  tasks: { total: number; done: number; blocked: number; inProgress: number; dueToday: number };
  files: { total: number };
  submission: { status: string; locked: boolean; name: string };
  deliverables: { complete: number; total: number };
  team: { total: number; owners: number; leads: number; members: number };
  blockers: { blockedTasks: number; blockedDeliverables: number; highRisks: number; missingSubmission: number };
  myWork: { assignedTasks: number; recentFiles: number; pinnedNotes: number };
  upcoming: { milestones: number; deadlines: number };
}

export async function loadMissionControl(hackathonId: string): Promise<MissionControlData> {
  const planning = createPlanningService();
  const ideas = createIdeasService();
  const research = createResearchService();
  const tasks = createTaskService();
  const submission = createSubmissionService();
  const team = createProfileService();

  const [obj, idd, res, tsk, sub, members] = await Promise.all([
    planning.listObjectives(hackathonId).catch(() => []),
    ideas.list(hackathonId).catch(() => []),
    research.list(hackathonId).catch(() => []),
    tasks.list(hackathonId).catch(() => []),
    submission.get(hackathonId).catch(() => null),
    team.listByHackathon(hackathonId).catch(() => []),
  ]);

  // Planning progress
  const planTotal = obj.length;
  const planDone = obj.filter((o) => o.status === "completed").length;

  // Ideas progress
  const ideasTotal = idd.length;
  const ideasDone = idd.filter((i) => i.status === "approved" || i.status === "implemented").length;

  // Research progress
  const resTotal = res.length;
  const resDone = res.filter((r) => r.verified).length;

  // Tasks
  const taskDone = tsk.filter((t) => t.status === "done").length;
  const taskBlocked = tsk.filter((t) => t.status === "blocked").length;
  const taskInProgress = tsk.filter((t) => t.status === "in_progress").length;
  const taskDueToday = tsk.filter((t) => {
    if (!t.dueDate) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(t.dueDate); due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  }).length;

  // Submission
  const subStatus = sub?.status ?? "none";
  const subLocked = sub?.locked ?? false;
  const delComplete = sub?.deliverables?.filter((d) => d.status === "complete").length ?? 0;
  const delTotal = sub?.deliverables?.filter((d) => d.status !== "not_required").length ?? 0;
  const missingSubmission = (sub?.deliverables ?? []).filter((d) => d.status === "incomplete").length;

  // Team
  const roleCounts = { owners: 0, leads: 0, members: 0 };
  for (const m of members) {
    if (m.role === "owner") roleCounts.owners++;
    else if (m.role === "lead") roleCounts.leads++;
    else roleCounts.members++;
  }

  // Blockers
  const highRisks = (await planning.listRisks(hackathonId).catch(() => [])).filter((r) => r.impact === "high" || r.likelihood === "high").length;
  const blockedDeliverables = sub?.deliverables?.filter((d) => d.status === "blocked").length ?? 0;

  // My work
  const assignedTasks = tsk.filter((t) => t.owner && t.status !== "done" && t.status !== "archived").length;
  let recentFiles = 0;
  let pinnedNotes = 0;
  try {
    const sb = getSupabaseBrowserClient();
    const filesCount = await sb.from("files").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).limit(1);
    recentFiles = filesCount.count ?? 0;
    const notesCount = await sb.from("notes").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).eq("pinned", true).limit(1);
    pinnedNotes = notesCount.count ?? 0;
  } catch { /* use defaults */ }

  // Upcoming
  const milestones = (await planning.listMilestones(hackathonId).catch(() => [])).filter((m) => m.status === "pending" || m.status === "in_progress").length;
  const deadlines = tsk.filter((t) => t.dueDate && t.status !== "done").length;

  function pct(done: number, total: number) {
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  const op = pct(planDone + ideasDone + resDone + taskDone + delComplete, planTotal + ideasTotal + resTotal + tsk.length + delTotal || 1);

  return {
    overall: { pct: op, label: op >= 90 ? "Ready" : op >= 60 ? "Good Progress" : op >= 30 ? "In Progress" : "Getting Started" },
    planning: { pct: pct(planDone, planTotal), label: `${planDone}/${planTotal}` },
    ideas: { pct: pct(ideasDone, ideasTotal), label: `${ideasDone}/${ideasTotal}` },
    research: { pct: pct(resDone, resTotal), label: `${resDone}/${resTotal}` },
    tasks: { total: tsk.length, done: taskDone, blocked: taskBlocked, inProgress: taskInProgress, dueToday: taskDueToday },
    files: { total: 0 },
    submission: { status: subStatus, locked: subLocked, name: sub?.title ?? "Not created" },
    deliverables: { complete: delComplete, total: delTotal },
    team: { total: members.length, ...roleCounts },
    blockers: { blockedTasks: taskBlocked, blockedDeliverables, highRisks, missingSubmission },
    myWork: { assignedTasks, recentFiles, pinnedNotes },
    upcoming: { milestones, deadlines },
  };
}
