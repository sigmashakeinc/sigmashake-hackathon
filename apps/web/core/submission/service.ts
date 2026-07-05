import { getSupabaseServerClient } from "@/services/supabase";
import type { Submission, SubmissionDeliverable, SubmissionChecklistItem, SubmissionStatus, DeliverableStatus } from "./types";

function mapSubmission(d: Record<string, unknown>): Submission {
  return {
    id: String(d.id ?? ""), hackathonId: String(d.hackathon_id ?? ""),
    status: (d.status as SubmissionStatus) ?? "draft", title: String(d.title ?? ""),
    description: (d.description as string) ?? null,
    submissionUrl: (d.submission_url as string) ?? null,
    devpostUrl: (d.devpost_url as string) ?? null,
    githubRepo: (d.github_repo as string) ?? null,
    liveDemoUrl: (d.live_demo_url as string) ?? null,
    videoUrl: (d.video_url as string) ?? null,
    presentationUrl: (d.presentation_url as string) ?? null,
    documentationUrl: (d.documentation_url as string) ?? null,
    additionalLinks: (d.additional_links as Record<string, string>) ?? null,
    notes: (d.notes as string) ?? null, locked: Boolean(d.locked),
    submittedAt: (d.submitted_at as string) ?? null,
    createdBy: (d.created_by as string) ?? null,
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

function mapDeliverable(i: Record<string, unknown>): SubmissionDeliverable {
  return {
    id: String(i.id ?? ""), submissionId: String(i.submission_id ?? ""),
    name: String(i.name ?? ""), description: (i.description as string) ?? null,
    status: (i.status as DeliverableStatus) ?? "incomplete",
    owner: (i.owner as string) ?? null, notes: (i.notes as string) ?? null,
    fileId: (i.file_id as string) ?? null, sortOrder: Number(i.sort_order ?? 0),
  };
}

function mapChecklist(i: Record<string, unknown>): SubmissionChecklistItem {
  return {
    id: String(i.id ?? ""), submissionId: String(i.submission_id ?? ""),
    label: String(i.label ?? ""), checked: Boolean(i.checked),
    blocked: Boolean(i.blocked), notRequired: Boolean(i.not_required),
    sortOrder: Number(i.sort_order ?? 0),
  };
}

export function createSubmissionService() {
  const supabase = getSupabaseServerClient();

  async function get(hackathonId: string) {
    const { data, error } = await supabase
      .from("submissions")
      .select("*, submission_deliverables(*), submission_checklist(*)")
      .eq("hackathon_id", hackathonId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const d = data as Record<string, unknown>;
    const sub = mapSubmission(d);
    const deliverables = ((d.submission_deliverables ?? []) as Record<string, unknown>[]).map(mapDeliverable);
    const checklist = ((d.submission_checklist ?? []) as Record<string, unknown>[]).map(mapChecklist);
    return { ...sub, deliverables, checklist } as Submission & { deliverables: SubmissionDeliverable[]; checklist: SubmissionChecklistItem[] };
  }

  async function create(hackathonId: string, title: string) {
    const { data, error } = await supabase.from("submissions").insert({ hackathon_id: hackathonId, title } as never).select().single();
    if (error) throw error;
    const sub = mapSubmission(data as Record<string, unknown>);

    const { DEFAULT_DELIVERABLES, DEFAULT_CHECKLIST } = await import("./types");
    const delRows = DEFAULT_DELIVERABLES.map((name, i) => ({ submission_id: sub.id, name, sort_order: i }));
    await supabase.from("submission_deliverables").insert(delRows as never);
    const chkRows = DEFAULT_CHECKLIST.map((label, i) => ({ submission_id: sub.id, label, sort_order: i }));
    await supabase.from("submission_checklist").insert(chkRows as never);

    return sub;
  }

  return {
    get, create,

    async update(id: string, input: Record<string, unknown>) {
      const { error } = await supabase.from("submissions").update(input as never).eq("id", id);
      if (error) throw error;
    },

    async updateDeliverable(id: string, input: Partial<SubmissionDeliverable>) {
      const db: Record<string, unknown> = {};
      if (input.status !== undefined) db.status = input.status;
      if (input.owner !== undefined) db.owner = input.owner;
      if (input.notes !== undefined) db.notes = input.notes;
      if (input.fileId !== undefined) db.file_id = input.fileId;
      const { error } = await supabase.from("submission_deliverables").update(db as never).eq("id", id);
      if (error) throw error;
    },

    async toggleChecklist(id: string, checked: boolean) {
      const { error } = await supabase.from("submission_checklist").update({ checked } as never).eq("id", id);
      if (error) throw error;
    },

    async submit(id: string) {
      const { error } = await supabase.from("submissions").update({
        status: "submitted", locked: true, submitted_at: new Date().toISOString(),
      } as never).eq("id", id);
      if (error) throw error;
    },

    async unlock(id: string) {
      const { error } = await supabase.from("submissions").update({
        status: "draft", locked: false, submitted_at: null,
      } as never).eq("id", id);
      if (error) throw error;
    },
  };
}
