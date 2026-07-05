import { getSupabaseServerClient } from "@/services/supabase";
import type { WorkspaceArchive, ArchiveStats, ArchiveStatus, ArchiveResult } from "./types";

export function createArchiveService() {
  function client() {
    return getSupabaseServerClient();
  }

  async function list(filters?: {
    status?: ArchiveStatus | "all";
    search?: string;
    year?: number;
    result?: ArchiveResult | "all";
    tag?: string;
  }): Promise<WorkspaceArchive[]> {
    const result = await client()
      .from("workspace_archive")
      .select("*")
      .order("archived_at", { ascending: false });

    const rows = (result.data ?? []) as Record<string, unknown>[];

    let filtered = rows;

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((r) => r.status === filters.status);
    }
    if (filters?.result && filters.result !== "all") {
      filtered = filtered.filter((r) => r.result === filters.result);
    }
    if (filters?.year) {
      filtered = filtered.filter((r) => {
        const d = r.start_date as string | null;
        return d?.startsWith(String(filters.year));
      });
    }
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter((r) =>
        (r.name as string)?.toLowerCase().includes(term) ||
        (r.organizer as string)?.toLowerCase().includes(term)
      );
    }

    return filtered.map(mapRowBasic);
  }

  async function getById(id: string): Promise<WorkspaceArchive | null> {
    const { data } = await client()
      .from("workspace_archive")
      .select("*")
      .eq("id", id)
      .single();

    if (!data) return null;
    return mapRowBasic(data as Record<string, unknown>);
  }

  async function archiveHackathon(
    hackathonId: string,
    input: {
      name: string;
      slug: string;
      organizer: string;
      status: ArchiveStatus;
      result?: ArchiveResult;
      placement?: string;
      prize?: string;
      startDate?: string;
      endDate?: string;
      submissionDeadline?: string;
      memberCount?: number;
      completionPct?: number;
      submissionStatus?: string;
      technology?: string;
      category?: string;
    }
  ): Promise<WorkspaceArchive> {
    const { data } = await client()
      .from("workspace_archive")
      .insert({
        hackathon_id: hackathonId,
        name: input.name,
        slug: input.slug,
        organizer: input.organizer,
        status: input.status,
        result: input.result ?? null,
        placement: input.placement ?? null,
        prize: input.prize ?? null,
        start_date: input.startDate ?? null,
        end_date: input.endDate ?? null,
        submission_deadline: input.submissionDeadline ?? null,
        member_count: input.memberCount ?? 0,
        completion_pct: input.completionPct ?? 0,
        submission_status: input.submissionStatus ?? null,
        technology: input.technology ?? null,
        category: input.category ?? null,
      } as never)
      .select()
      .single() as never;

    return data as unknown as WorkspaceArchive;
  }

  async function update(
    id: string,
    input: Partial<WorkspaceArchive>
  ): Promise<void> {
    await client()
      .from("workspace_archive")
      .update(input as never)
      .eq("id", id) as never;
  }

  async function remove(id: string): Promise<void> {
    await client()
      .from("workspace_archive")
      .delete()
      .eq("id", id) as never;
  }

  async function stats(): Promise<ArchiveStats> {
    const { data: all } = await client()
      .from("workspace_archive")
      .select("status, result, completion_pct, metadata");

    const rows = (all ?? []) as { status: string; result: string | null; completion_pct: number; metadata: Record<string, unknown> }[];
    const completed = rows.filter((r) => r.status === "completed");
    const wins = rows.filter((r) => r.result === "won");
    const placements = rows.filter((r) => r.result === "won" || r.result === "placed");

    // Count lessons via a separate simpler query
    let lessonTotal = 0;
    try {
      const result = await client()
        .from("lessons_learned")
        .select("id", { count: "exact", head: true }) as never;
      lessonTotal = (result as { count: number | null }).count ?? 0;
    } catch { /* ignore */ }

    return {
      totalArchived: rows.length,
      wins: wins.length,
      placements: placements.length,
      completedProjects: completed.length,
      avgHealthScore: completed.length > 0 ? Math.round(completed.reduce((a, r) => {
        const meta = r.metadata as { healthScore?: number } | null;
        return a + (meta?.healthScore ?? 0);
      }, 0) / completed.length) : 0,
      avgCompletionPct: rows.length > 0 ? Math.round(rows.reduce((a, r) => a + (r.completion_pct ?? 0), 0) / rows.length) : 0,
      avgSubmissionReadiness: completed.length > 0 ? Math.round(completed.reduce((a, r) => a + (r.completion_pct ?? 0), 0) / completed.length) : 0,
      totalLessons: lessonTotal,
    };
  }

  return { list, getById, archiveHackathon, update, remove, stats };
}

function mapRowBasic(row: Record<string, unknown>): WorkspaceArchive {
  return {
    id: row.id as string,
    hackathonId: row.hackathon_id as string,
    name: row.name as string,
    slug: row.slug as string,
    organizer: row.organizer as string,
    status: row.status as ArchiveStatus,
    result: row.result as ArchiveResult | null,
    placement: row.placement as string | null,
    prize: row.prize as string | null,
    bannerUrl: row.banner_url as string | null,
    logoUrl: row.logo_url as string | null,
    startDate: row.start_date as string | null,
    endDate: row.end_date as string | null,
    submissionDeadline: row.submission_deadline as string | null,
    memberCount: (row.member_count as number) ?? 0,
    completionPct: (row.completion_pct as number) ?? 0,
    submissionStatus: row.submission_status as string | null,
    technology: row.technology as string | null,
    category: row.category as string | null,
    templateOrigin: row.template_origin as string | null,
    notes: row.notes as string | null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    archivedAt: row.archived_at as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    lessonCount: 0,
    hasRetrospective: false,
  };
}
