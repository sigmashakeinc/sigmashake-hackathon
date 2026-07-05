import { getSupabaseServerClient } from "@/services/supabase";
import type { Idea, IdeaInput } from "./types";

function mapIdea(d: Record<string, unknown>): Idea {
  return {
    id: String(d.id ?? ""), hackathonId: String(d.hackathon_id ?? ""),
    title: String(d.title ?? ""), description: (d.description as string) ?? null,
    summary: (d.summary as string) ?? null, category: (d.category as Idea["category"]) ?? "general",
    customCategory: (d.custom_category as string) ?? null,
    status: (d.status as Idea["status"]) ?? "open", priority: (d.priority as Idea["priority"]) ?? "medium",
    author: (d.author as string) ?? null, owner: (d.owner as string) ?? null,
    tags: (d.tags as string[]) ?? null, colour: (d.colour as string) ?? null,
    pinned: Boolean(d.pinned), archived: Boolean(d.archived),
    voteCount: Number(d.vote_count ?? 0),
    referencedObjectiveId: (d.referenced_objective_id as string) ?? null,
    referencedRequirementId: (d.referenced_requirement_id as string) ?? null,
    referencedMilestoneId: (d.referenced_milestone_id as string) ?? null,
    convertedToTask: Boolean(d.converted_to_task),
    convertedAt: (d.converted_at as string) ?? null, sortOrder: Number(d.sort_order ?? 0),
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

export function createIdeasService() {
  const supabase = getSupabaseServerClient();

  return {
    async list(hackathonId: string, includeArchived = false) {
      let query = supabase.from("ideas").select("*").eq("hackathon_id", hackathonId);
      if (!includeArchived) query = query.eq("archived", false);
      query = query.order("pinned", { ascending: false }).order("vote_count", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((r) => mapIdea(r as Record<string, unknown>));
    },

    async getById(id: string) {
      const { data, error } = await supabase.from("ideas").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? mapIdea(data as Record<string, unknown>) : null;
    },

    async create(hackathonId: string, input: IdeaInput) {
      const { data, error } = await supabase.from("ideas").insert({
        hackathon_id: hackathonId, title: input.title, description: input.description,
        summary: input.summary, category: input.category ?? "general",
        status: input.status ?? "open", priority: input.priority ?? "medium",
        author: input.author, owner: input.owner, tags: input.tags,
        colour: input.colour, custom_category: input.customCategory,
        referenced_objective_id: input.referencedObjectiveId,
        referenced_requirement_id: input.referencedRequirementId,
        referenced_milestone_id: input.referencedMilestoneId,
      } as never).select().single();
      if (error) throw error;
      return mapIdea(data as Record<string, unknown>);
    },

    async update(id: string, input: Partial<IdeaInput & { pinned?: boolean; archived?: boolean; status?: string }>) {
      const db: Record<string, unknown> = {};
      if (input.title !== undefined) db.title = input.title;
      if (input.description !== undefined) db.description = input.description;
      if (input.summary !== undefined) db.summary = input.summary;
      if (input.category !== undefined) db.category = input.category;
      if (input.customCategory !== undefined) db.custom_category = input.customCategory;
      if (input.status !== undefined) db.status = input.status;
      if (input.priority !== undefined) db.priority = input.priority;
      if (input.author !== undefined) db.author = input.author;
      if (input.owner !== undefined) db.owner = input.owner;
      if (input.tags !== undefined) db.tags = input.tags;
      if (input.colour !== undefined) db.colour = input.colour;
      if (input.pinned !== undefined) db.pinned = input.pinned;
      if (input.archived !== undefined) db.archived = input.archived;
      const { error } = await supabase.from("ideas").update(db as never).eq("id", id);
      if (error) throw error;
    },

    async delete(id: string) {
      const { error } = await supabase.from("ideas").delete().eq("id", id);
      if (error) throw error;
    },

    async vote(ideaId: string, userId: string) {
      const { error: insertError } = await supabase.from("idea_votes").insert({ idea_id: ideaId, user_id: userId } as never);
      if (insertError) throw insertError;
      const { error: updateError } = await supabase.rpc("increment_idea_votes" as never, { idea_id: ideaId } as never);
      if (updateError) throw updateError;
    },

    async unvote(ideaId: string, userId: string) {
      const { error: deleteError } = await supabase.from("idea_votes").delete().eq("idea_id", ideaId).eq("user_id", userId);
      if (deleteError) throw deleteError;
      const { error: updateError } = await supabase.rpc("decrement_idea_votes" as never, { idea_id: ideaId } as never);
      if (updateError) throw updateError;
    },

    async hasVoted(ideaId: string, userId: string) {
      const { data, error } = await supabase.from("idea_votes").select("id").eq("idea_id", ideaId).eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return !!data;
    },
  };
}
