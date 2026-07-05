import { getSupabaseServerClient } from "@/services/supabase";
import type { Retrospective, RetrospectiveInput } from "./types";

export function createRetrospectiveService() {
  function client() {
    return getSupabaseServerClient();
  }

  async function getByArchive(archiveId: string): Promise<Retrospective | null> {
    const { data } = await client()
      .from("retrospectives")
      .select("*")
      .eq("archive_id", archiveId)
      .maybeSingle();

    if (!data) return null;
    return mapRow(data as Record<string, unknown>);
  }

  async function create(archiveId: string, input: RetrospectiveInput, userId?: string): Promise<Retrospective> {
    const { data } = await client()
      .from("retrospectives")
      .insert({
        archive_id: archiveId,
        went_well: input.wentWell ?? [],
        went_badly: input.wentBadly ?? [],
        problems: input.problems ?? [],
        successes: input.successes ?? [],
        improvements: input.improvements ?? [],
        team_feedback: input.teamFeedback ?? null,
        technical_feedback: input.technicalFeedback ?? null,
        planning_feedback: input.planningFeedback ?? null,
        submission_feedback: input.submissionFeedback ?? null,
        overall_score: input.overallScore ?? null,
        created_by: userId ?? null,
      } as never)
      .select()
      .single() as never;

    return data as unknown as Retrospective;
  }

  async function update(archiveId: string, input: RetrospectiveInput): Promise<void> {
    await client()
      .from("retrospectives")
      .update({
        went_well: input.wentWell,
        went_badly: input.wentBadly,
        problems: input.problems,
        successes: input.successes,
        improvements: input.improvements,
        team_feedback: input.teamFeedback,
        technical_feedback: input.technicalFeedback,
        planning_feedback: input.planningFeedback,
        submission_feedback: input.submissionFeedback,
        overall_score: input.overallScore,
      } as never)
      .eq("archive_id", archiveId) as never;
  }

  return { getByArchive, create, update };
}

function mapRow(row: Record<string, unknown>): Retrospective {
  return {
    id: row.id as string,
    archiveId: row.archive_id as string,
    wentWell: (row.went_well as string[]) ?? [],
    wentBadly: (row.went_badly as string[]) ?? [],
    problems: (row.problems as string[]) ?? [],
    successes: (row.successes as string[]) ?? [],
    improvements: (row.improvements as string[]) ?? [],
    teamFeedback: row.team_feedback as string | null,
    technicalFeedback: row.technical_feedback as string | null,
    planningFeedback: row.planning_feedback as string | null,
    submissionFeedback: row.submission_feedback as string | null,
    overallScore: row.overall_score as number | null,
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
