import { getSupabaseServerClient } from "@/services/supabase";
import type { ResearchItem, ResearchInput } from "./types";

function mapItem(d: Record<string, unknown>): ResearchItem {
  return {
    id: String(d.id ?? ""), hackathonId: String(d.hackathon_id ?? ""),
    title: String(d.title ?? ""), summary: (d.summary as string) ?? null,
    description: (d.description as string) ?? null,
    category: (d.category as ResearchItem["category"]) ?? "general",
    sourceType: (d.source_type as ResearchItem["sourceType"]) ?? "general",
    url: (d.url as string) ?? null, author: (d.author as string) ?? null,
    addedBy: (d.added_by as string) ?? null, tags: (d.tags as string[]) ?? null,
    pinned: Boolean(d.pinned), archived: Boolean(d.archived),
    verified: Boolean(d.verified), favourite: Boolean(d.favourite),
    verificationStatus: (d.verification_status as ResearchItem["verificationStatus"]) ?? "needs_review",
    rating: (d.rating as number) ?? null, notes: (d.notes as string) ?? null,
    referencedIdeaId: (d.referenced_idea_id as string) ?? null,
    referencedObjectiveId: (d.referenced_objective_id as string) ?? null,
    referencedRequirementId: (d.referenced_requirement_id as string) ?? null,
    referencedMilestoneId: (d.referenced_milestone_id as string) ?? null,
    sortOrder: Number(d.sort_order ?? 0),
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

export function createResearchService() {
  const supabase = getSupabaseServerClient();

  return {
    async list(hackathonId: string, includeArchived = false) {
      let q = supabase.from("research_items").select("*").eq("hackathon_id", hackathonId);
      if (!includeArchived) q = q.eq("archived", false);
      q = q.order("pinned", { ascending: false }).order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => mapItem(r as Record<string, unknown>));
    },

    async create(hackathonId: string, input: ResearchInput) {
      const { data, error } = await supabase.from("research_items").insert({
        hackathon_id: hackathonId, title: input.title, summary: input.summary,
        description: input.description, category: input.category ?? "general",
        source_type: input.sourceType ?? "general", url: input.url,
        author: input.author, tags: input.tags, rating: input.rating,
        notes: input.notes,
        referenced_idea_id: input.referencedIdeaId,
        referenced_objective_id: input.referencedObjectiveId,
        referenced_requirement_id: input.referencedRequirementId,
        referenced_milestone_id: input.referencedMilestoneId,
      } as never).select().single();
      if (error) throw error;
      return mapItem(data as Record<string, unknown>);
    },

    async update(id: string, input: Partial<ResearchInput & { pinned?: boolean; archived?: boolean; verified?: boolean; favourite?: boolean; verificationStatus?: string }>) {
      const db: Record<string, unknown> = {};
      if (input.title !== undefined) db.title = input.title;
      if (input.summary !== undefined) db.summary = input.summary;
      if (input.description !== undefined) db.description = input.description;
      if (input.category !== undefined) db.category = input.category;
      if (input.sourceType !== undefined) db.source_type = input.sourceType;
      if (input.url !== undefined) db.url = input.url;
      if (input.author !== undefined) db.author = input.author;
      if (input.tags !== undefined) db.tags = input.tags;
      if (input.pinned !== undefined) db.pinned = input.pinned;
      if (input.archived !== undefined) db.archived = input.archived;
      if (input.verified !== undefined) db.verified = input.verified;
      if (input.favourite !== undefined) db.favourite = input.favourite;
      if (input.verificationStatus !== undefined) db.verification_status = input.verificationStatus;
      if (input.rating !== undefined) db.rating = input.rating;
      if (input.notes !== undefined) db.notes = input.notes;
      const { error } = await supabase.from("research_items").update(db as never).eq("id", id);
      if (error) throw error;
    },

    async delete(id: string) {
      const { error } = await supabase.from("research_items").delete().eq("id", id);
      if (error) throw error;
    },
  };
}
