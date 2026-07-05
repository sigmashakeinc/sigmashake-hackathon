import { getSupabaseServerClient } from "@/services/supabase";
import type { Note, NoteInput } from "./types";

function mapNote(d: Record<string, unknown>): Note {
  return {
    id: String(d.id ?? ""), hackathonId: (d.hackathon_id as string) ?? null,
    userId: (d.user_id as string) ?? null, title: String(d.title ?? ""),
    content: (d.content as string) ?? null,
    category: (d.category as Note["category"]) ?? "general",
    noteType: (d.note_type as Note["noteType"]) ?? "shared",
    tags: (d.tags as string[]) ?? null, colour: (d.colour as string) ?? null,
    pinned: Boolean(d.pinned), archived: Boolean(d.archived), favourite: Boolean(d.favourite),
    author: (d.author as string) ?? null,
    linkedObjectiveId: (d.linked_objective_id as string) ?? null,
    linkedRequirementId: (d.linked_requirement_id as string) ?? null,
    linkedIdeaId: (d.linked_idea_id as string) ?? null,
    linkedResearchId: (d.linked_research_id as string) ?? null,
    linkedTaskId: (d.linked_task_id as string) ?? null,
    linkedDeliverableId: (d.linked_deliverable_id as string) ?? null,
    wordCount: Number(d.word_count ?? 0), charCount: Number(d.char_count ?? 0),
    sortOrder: Number(d.sort_order ?? 0),
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

export function createNotesService() {
  const supabase = getSupabaseServerClient();

  return {
    async list(hackathonId: string | null, userId: string | null, noteType?: string, includeArchived = false) {
      let q = supabase.from("notes").select("*").order("pinned", { ascending: false }).order("updated_at", { ascending: false });
      if (hackathonId && noteType !== "personal") q = q.eq("hackathon_id", hackathonId);
      if (noteType) q = q.eq("note_type", noteType);
      if (!includeArchived) q = q.eq("archived", false);
      if (noteType === "personal" && userId) q = q.eq("user_id", userId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => mapNote(r as Record<string, unknown>));
    },

    async getById(id: string) {
      const { data, error } = await supabase.from("notes").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? mapNote(data as Record<string, unknown>) : null;
    },

    async create(input: NoteInput & { hackathonId?: string | null; userId?: string | null }) {
      const { data, error } = await supabase.from("notes").insert({
        hackathon_id: input.hackathonId ?? null, user_id: input.userId ?? null,
        title: input.title ?? "Untitled", content: input.content,
        category: input.category ?? "general", note_type: input.noteType ?? "shared",
        tags: input.tags, colour: input.colour, pinned: input.pinned ?? false,
        archived: input.archived ?? false, favourite: input.favourite ?? false,
        author: input.author,
        linked_objective_id: input.linkedObjectiveId,
        linked_requirement_id: input.linkedRequirementId,
        linked_idea_id: input.linkedIdeaId,
        linked_research_id: input.linkedResearchId,
        linked_task_id: input.linkedTaskId,
        linked_deliverable_id: input.linkedDeliverableId,
      } as never).select().single();
      if (error) throw error;
      return mapNote(data as Record<string, unknown>);
    },

    async update(id: string, input: NoteInput) {
      const db: Record<string, unknown> = {};
      if (input.title !== undefined) db.title = input.title;
      if (input.content !== undefined) db.content = input.content;
      if (input.category !== undefined) db.category = input.category;
      if (input.noteType !== undefined) db.note_type = input.noteType;
      if (input.tags !== undefined) db.tags = input.tags;
      if (input.colour !== undefined) db.colour = input.colour;
      if (input.pinned !== undefined) db.pinned = input.pinned;
      if (input.archived !== undefined) db.archived = input.archived;
      if (input.favourite !== undefined) db.favourite = input.favourite;
      if (input.content !== undefined) {
        const text = input.content ?? "";
        db.word_count = text.split(/\s+/).filter(Boolean).length;
        db.char_count = text.length;
      }
      const { error } = await supabase.from("notes").update(db as never).eq("id", id);
      if (error) throw error;
    },

    async delete(id: string) {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
  };
}
