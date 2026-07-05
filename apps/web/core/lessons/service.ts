import { getSupabaseServerClient } from "@/services/supabase";
import type { Lesson, LessonInput, LessonSeverity } from "./types";

export function createLessonService() {
  function client() {
    return getSupabaseServerClient();
  }

  async function list(archiveId: string): Promise<Lesson[]> {
    const { data } = await client()
      .from("lessons_learned")
      .select("*")
      .eq("archive_id", archiveId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    return (data ?? []).map((r: Record<string, unknown>) => mapRow(r));
  }

  async function search(archiveId: string, term: string): Promise<Lesson[]> {
    const like = `%${term}%`;
    const { data } = await client()
      .from("lessons_learned")
      .select("*")
      .eq("archive_id", archiveId)
      .or(`title.ilike.${like},content.ilike.${like},tags.cs.{${term}}`)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    return (data ?? []).map((r: Record<string, unknown>) => mapRow(r));
  }

  async function create(archiveId: string, input: LessonInput, userId?: string): Promise<Lesson> {
    const { data } = await client()
      .from("lessons_learned")
      .insert({
        archive_id: archiveId,
        title: input.title,
        content: input.content,
        category: input.category ?? "general",
        severity: input.severity ?? "insight",
        tags: input.tags ?? [],
        pinned: input.pinned ?? false,
        favourite: input.favourite ?? false,
        references_module: input.referencesModule ?? null,
        references_id: input.referencesId ?? null,
        created_by: userId ?? null,
      } as never)
      .select()
      .single() as never;

    return data as unknown as Lesson;
  }

  async function update(id: string, input: Partial<LessonInput>): Promise<void> {
    await client()
      .from("lessons_learned")
      .update(input as never)
      .eq("id", id) as never;
  }

  async function remove(id: string): Promise<void> {
    await client()
      .from("lessons_learned")
      .delete()
      .eq("id", id) as never;
  }

  return { list, search, create, update, remove };
}

function mapRow(row: Record<string, unknown>): Lesson {
  return {
    id: row.id as string,
    archiveId: row.archive_id as string,
    title: row.title as string,
    content: row.content as string,
    category: row.category as string,
    severity: row.severity as LessonSeverity,
    tags: (row.tags as string[]) ?? [],
    pinned: (row.pinned as boolean) ?? false,
    favourite: (row.favourite as boolean) ?? false,
    referencesModule: row.references_module as string | null,
    referencesId: row.references_id as string | null,
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
