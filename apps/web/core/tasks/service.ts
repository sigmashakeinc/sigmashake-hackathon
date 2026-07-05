import { getSupabaseServerClient } from "@/services/supabase";
import type { Task, TaskInput } from "./types";

function mapTask(d: Record<string, unknown>): Task {
  return {
    id: String(d.id ?? ""), hackathonId: String(d.hackathon_id ?? ""),
    title: String(d.title ?? ""), description: (d.description as string) ?? null,
    status: (d.status as Task["status"]) ?? "backlog",
    priority: (d.priority as Task["priority"]) ?? "medium",
    severity: (d.severity as Task["severity"]) ?? "medium",
    difficulty: (d.difficulty as number) ?? null,
    estimatedHours: (d.estimated_hours as number) ?? null,
    actualHours: (d.actual_hours as number) ?? null,
    owner: (d.owner as string) ?? null, assignees: (d.assignees as string[]) ?? null,
    reviewer: (d.reviewer as string) ?? null, createdBy: (d.created_by as string) ?? null,
    dueDate: (d.due_date as string) ?? null, startDate: (d.start_date as string) ?? null,
    completedDate: (d.completed_date as string) ?? null,
    labels: (d.labels as string[]) ?? null, tags: (d.tags as string[]) ?? null,
    blocked: Boolean(d.blocked), archived: Boolean(d.archived),
    parentTaskId: (d.parent_task_id as string) ?? null, sortOrder: Number(d.sort_order ?? 0),
    referencedObjectiveId: (d.referenced_objective_id as string) ?? null,
    referencedRequirementId: (d.referenced_requirement_id as string) ?? null,
    referencedMilestoneId: (d.referenced_milestone_id as string) ?? null,
    referencedDeliverableId: (d.referenced_deliverable_id as string) ?? null,
    referencedIdeaId: (d.referenced_idea_id as string) ?? null,
    referencedResearchId: (d.referenced_research_id as string) ?? null,
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

export function createTaskService() {
  const supabase = getSupabaseServerClient();

  return {
    async list(hackathonId: string, includeArchived = false) {
      let q = supabase.from("tasks").select("*, task_checklist_items(*)").eq("hackathon_id", hackathonId);
      if (!includeArchived) q = q.eq("archived", false);
      q = q.order("sort_order").order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r: Record<string, unknown>) => {
        const t = mapTask(r);
        t.checklistItems = ((r.task_checklist_items ?? []) as Record<string, unknown>[]).map((i) => ({
          id: String(i.id ?? ""), taskId: String(i.task_id ?? ""), label: String(i.label ?? ""),
          checked: Boolean(i.checked), assignedTo: (i.assigned_to as string) ?? null,
          sortOrder: Number(i.sort_order ?? 0), createdAt: String(i.created_at ?? ""),
        }));
        return t;
      });
    },

    async getById(id: string) {
      const { data, error } = await supabase.from("tasks").select("*, task_checklist_items(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const t = mapTask(data as Record<string, unknown>);
      t.checklistItems = ((data as Record<string, unknown>).task_checklist_items as Record<string, unknown>[] ?? []).map((i) => ({
        id: String(i.id ?? ""), taskId: String(i.task_id ?? ""), label: String(i.label ?? ""),
        checked: Boolean(i.checked), assignedTo: (i.assigned_to as string) ?? null,
        sortOrder: Number(i.sort_order ?? 0), createdAt: String(i.created_at ?? ""),
      }));
      return t;
    },

    async create(hackathonId: string, input: TaskInput) {
      const { data, error } = await supabase.from("tasks").insert({
        hackathon_id: hackathonId, title: input.title, description: input.description,
        status: input.status ?? "backlog", priority: input.priority ?? "medium",
        severity: input.severity ?? "medium", difficulty: input.difficulty,
        estimated_hours: input.estimatedHours, owner: input.owner,
        assignees: input.assignees, reviewer: input.reviewer,
        due_date: input.dueDate, start_date: input.startDate,
        labels: input.labels, tags: input.tags, parent_task_id: input.parentTaskId,
        referenced_objective_id: input.referencedObjectiveId,
        referenced_requirement_id: input.referencedRequirementId,
        referenced_milestone_id: input.referencedMilestoneId,
        referenced_deliverable_id: input.referencedDeliverableId,
        referenced_idea_id: input.referencedIdeaId,
        referenced_research_id: input.referencedResearchId,
      } as never).select().single();
      if (error) throw error;
      return mapTask(data as Record<string, unknown>);
    },

    async update(id: string, input: Partial<TaskInput & { status?: string; blocked?: boolean; archived?: boolean; completed_date?: string }>) {
      const db: Record<string, unknown> = {};
      if (input.title !== undefined) db.title = input.title;
      if (input.description !== undefined) db.description = input.description;
      if (input.status !== undefined) db.status = input.status;
      if (input.priority !== undefined) db.priority = input.priority;
      if (input.severity !== undefined) db.severity = input.severity;
      if (input.difficulty !== undefined) db.difficulty = input.difficulty;
      if (input.estimatedHours !== undefined) db.estimated_hours = input.estimatedHours;
      if (input.owner !== undefined) db.owner = input.owner;
      if (input.assignees !== undefined) db.assignees = input.assignees;
      if (input.reviewer !== undefined) db.reviewer = input.reviewer;
      if (input.dueDate !== undefined) db.due_date = input.dueDate;
      if (input.startDate !== undefined) db.start_date = input.startDate;
      if (input.blocked !== undefined) db.blocked = input.blocked;
      if (input.archived !== undefined) db.archived = input.archived;
      if (input.completed_date !== undefined) db.completed_date = input.completed_date;
      if (input.labels !== undefined) db.labels = input.labels;
      if (input.tags !== undefined) db.tags = input.tags;
      if (input.parentTaskId !== undefined) db.parent_task_id = input.parentTaskId;
      db.completed_date = input.status === "done" ? new Date().toISOString() : undefined;
      const { error } = await supabase.from("tasks").update(db as never).eq("id", id);
      if (error) throw error;
    },

    async updateStatus(id: string, status: string) {
      const db: Record<string, unknown> = { status };
      if (status === "done") db.completed_date = new Date().toISOString();
      const { error } = await supabase.from("tasks").update(db as never).eq("id", id);
      if (error) throw error;
    },

    async delete(id: string) {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },

    async addChecklist(taskId: string, label: string) {
      const { error } = await supabase.from("task_checklist_items").insert({ task_id: taskId, label } as never);
      if (error) throw error;
    },

    async toggleChecklist(id: string, checked: boolean) {
      const { error } = await supabase.from("task_checklist_items").update({ checked } as never).eq("id", id);
      if (error) throw error;
    },

    async removeChecklist(id: string) {
      const { error } = await supabase.from("task_checklist_items").delete().eq("id", id);
      if (error) throw error;
    },
  };
}
