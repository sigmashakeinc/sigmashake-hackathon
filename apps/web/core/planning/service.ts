import { getSupabaseServerClient } from "@/services/supabase";
import type {
  Objective, Milestone, Deliverable, Requirement,
  Risk, Decision, ChecklistTemplate, PlanningNote, PlanningCounts,
} from "./types";

function mapObjective(d: Record<string, unknown>): Objective {
  return {
    id: String(d.id), hackathonId: String(d.hackathon_id), title: String(d.title ?? ""),
    description: (d.description as string) ?? null, priority: (d.priority as Objective["priority"]) ?? "medium",
    status: (d.status as Objective["status"]) ?? "draft", owner: (d.owner as string) ?? null,
    targetDate: (d.target_date as string) ?? null, tags: (d.tags as string[]) ?? null,
    notes: (d.notes as string) ?? null, sortOrder: Number(d.sort_order ?? 0),
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

function mapMilestone(d: Record<string, unknown>): Milestone {
  return {
    id: String(d.id), hackathonId: String(d.hackathon_id), name: String(d.name ?? ""),
    description: (d.description as string) ?? null, dueDate: (d.due_date as string) ?? null,
    status: (d.status as Milestone["status"]) ?? "pending", completionPct: Number(d.completion_pct ?? 0),
    dependencies: (d.dependencies as string) ?? null, sortOrder: Number(d.sort_order ?? 0),
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

function mapDeliverable(d: Record<string, unknown>): Deliverable {
  return {
    id: String(d.id), hackathonId: String(d.hackathon_id), name: String(d.name ?? ""),
    description: (d.description as string) ?? null, status: (d.status as Deliverable["status"]) ?? "pending",
    owner: (d.owner as string) ?? null, notes: (d.notes as string) ?? null,
    deadline: (d.deadline as string) ?? null, sortOrder: Number(d.sort_order ?? 0),
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

function mapRequirement(d: Record<string, unknown>): Requirement {
  return {
    id: String(d.id), hackathonId: String(d.hackathon_id), title: String(d.title ?? ""),
    description: (d.description as string) ?? null, category: (d.category as string) ?? null,
    priority: (d.priority as Requirement["priority"]) ?? "medium", source: (d.source as string) ?? null,
    status: (d.status as Requirement["status"]) ?? "draft", notes: (d.notes as string) ?? null,
    sortOrder: Number(d.sort_order ?? 0), createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

function mapRisk(d: Record<string, unknown>): Risk {
  return {
    id: String(d.id), hackathonId: String(d.hackathon_id), risk: String(d.risk ?? ""),
    likelihood: (d.likelihood as Risk["likelihood"]) ?? "medium", impact: (d.impact as Risk["impact"]) ?? "medium",
    mitigation: (d.mitigation as string) ?? null, owner: (d.owner as string) ?? null,
    status: (d.status as Risk["status"]) ?? "identified", sortOrder: Number(d.sort_order ?? 0),
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

function mapDecision(d: Record<string, unknown>): Decision {
  return {
    id: String(d.id), hackathonId: String(d.hackathon_id), title: String(d.title ?? ""),
    decision: (d.decision as string) ?? null, reasoning: (d.reasoning as string) ?? null,
    alternatives: (d.alternatives as string) ?? null, author: (d.author as string) ?? null,
    status: (d.status as Decision["status"]) ?? "proposed", sortOrder: Number(d.sort_order ?? 0),
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

function mapChecklistTemplate(d: Record<string, unknown>): ChecklistTemplate {
  return {
    id: String(d.id), hackathonId: String(d.hackathon_id), name: String(d.name ?? ""),
    description: (d.description as string) ?? null, sortOrder: Number(d.sort_order ?? 0),
    createdAt: String(d.created_at ?? ""),
  };
}

function mapNote(d: Record<string, unknown>): PlanningNote {
  return {
    id: String(d.id), hackathonId: String(d.hackathon_id), title: String(d.title ?? "Untitled"),
    content: (d.content as string) ?? null, createdBy: (d.created_by as string) ?? null,
    sortOrder: Number(d.sort_order ?? 0), createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

export function createPlanningService() {
  const supabase = getSupabaseServerClient();

  return {
    async listObjectives(hackathonId: string) {
      const { data, error } = await supabase.from("objectives").select("*").eq("hackathon_id", hackathonId).order("sort_order");
      if (error) throw error;
      return (data ?? []).map((r) => mapObjective(r as Record<string, unknown>));
    },

    async listMilestones(hackathonId: string) {
      const { data, error } = await supabase.from("milestones").select("*").eq("hackathon_id", hackathonId).order("sort_order");
      if (error) throw error;
      return (data ?? []).map((r) => mapMilestone(r as Record<string, unknown>));
    },

    async listDeliverables(hackathonId: string) {
      const { data, error } = await supabase.from("deliverables").select("*").eq("hackathon_id", hackathonId).order("sort_order");
      if (error) throw error;
      return (data ?? []).map((r) => mapDeliverable(r as Record<string, unknown>));
    },

    async listRequirements(hackathonId: string) {
      const { data, error } = await supabase.from("requirements").select("*").eq("hackathon_id", hackathonId).order("sort_order");
      if (error) throw error;
      return (data ?? []).map((r) => mapRequirement(r as Record<string, unknown>));
    },

    async listRisks(hackathonId: string) {
      const { data, error } = await supabase.from("risks").select("*").eq("hackathon_id", hackathonId).order("sort_order");
      if (error) throw error;
      return (data ?? []).map((r) => mapRisk(r as Record<string, unknown>));
    },

    async listDecisions(hackathonId: string) {
      const { data, error } = await supabase.from("decisions").select("*").eq("hackathon_id", hackathonId).order("sort_order");
      if (error) throw error;
      return (data ?? []).map((r) => mapDecision(r as Record<string, unknown>));
    },

    async listChecklists(hackathonId: string) {
      const { data, error } = await supabase.from("checklist_templates").select("*, checklist_items(*)").eq("hackathon_id", hackathonId).order("sort_order");
      if (error) throw error;
      return (data ?? []).map((r: Record<string, unknown>) => {
        const t = mapChecklistTemplate(r);
        t.items = ((r.checklist_items ?? []) as Record<string, unknown>[]).map((i) => ({
          id: String(i.id ?? ""), templateId: String(i.template_id ?? ""), label: String(i.label ?? ""),
          checked: Boolean(i.checked), assignedTo: (i.assigned_to as string) ?? null,
          sortOrder: Number(i.sort_order ?? 0), createdAt: String(i.created_at ?? ""), updatedAt: String(i.updated_at ?? ""),
        }));
        return t;
      });
    },

    async listNotes(hackathonId: string) {
      const { data, error } = await supabase.from("planning_notes").select("*").eq("hackathon_id", hackathonId).order("sort_order");
      if (error) throw error;
      return (data ?? []).map((r) => mapNote(r as Record<string, unknown>));
    },

    async getCounts(hackathonId: string): Promise<PlanningCounts> {
      const [objectives, milestones, deliverables, risks, decisions] = await Promise.all([
        this.listObjectives(hackathonId), this.listMilestones(hackathonId),
        this.listDeliverables(hackathonId), this.listRisks(hackathonId), this.listDecisions(hackathonId),
      ]);
      return {
        objectives: { total: objectives.length, completed: objectives.filter((o) => o.status === "completed").length },
        milestones: { total: milestones.length, completed: milestones.filter((m) => m.status === "completed").length },
        deliverables: { total: deliverables.length, completed: deliverables.filter((d) => d.status === "completed").length },
        risks: { total: risks.length, active: risks.filter((r) => r.status === "identified").length },
        decisions: { total: decisions.length, accepted: decisions.filter((d) => d.status === "accepted").length },
      };
    },

    async createObjective(hackathonId: string, input: Partial<Objective>) {
      const { data, error } = await supabase.from("objectives").insert({
        hackathon_id: hackathonId, title: input.title, description: input.description,
        priority: input.priority ?? "medium", status: input.status ?? "active",
        owner: input.owner, target_date: input.targetDate, tags: input.tags, notes: input.notes,
      } as never).select().single();
      if (error) throw error;
      return mapObjective(data as Record<string, unknown>);
    },

    async updateObjective(id: string, input: Partial<Objective>) {
      const db: Record<string, unknown> = {};
      if (input.title !== undefined) db.title = input.title;
      if (input.description !== undefined) db.description = input.description;
      if (input.priority !== undefined) db.priority = input.priority;
      if (input.status !== undefined) db.status = input.status;
      if (input.owner !== undefined) db.owner = input.owner;
      if (input.targetDate !== undefined) db.target_date = input.targetDate;
      if (input.tags !== undefined) db.tags = input.tags;
      if (input.notes !== undefined) db.notes = input.notes;
      const { error } = await supabase.from("objectives").update(db as never).eq("id", id);
      if (error) throw error;
    },

    async deleteObjective(id: string) {
      const { error } = await supabase.from("objectives").delete().eq("id", id);
      if (error) throw error;
    },

    async toggleChecklistItem(id: string, checked: boolean) {
      const { error } = await supabase.from("checklist_items").update({ checked } as never).eq("id", id);
      if (error) throw error;
    },
  };
}
