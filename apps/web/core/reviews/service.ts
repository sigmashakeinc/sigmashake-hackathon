import { getSupabaseServerClient } from "@/services/supabase";
import type { Review, ReviewRequest, ReviewStatus, ReviewInput } from "./types";

export function createReviewService() {
  function client() {
    return getSupabaseServerClient();
  }

  async function getReviews(module: string, moduleId: string): Promise<Review[]> {
    const { data } = await client()
      .from("reviews")
      .select("*")
      .eq("module", module)
      .eq("module_id", moduleId)
      .order("created_at", { ascending: false });

    return ((data ?? []) as Record<string, unknown>[]).map(mapReviewRow);
  }

  async function createReview(hackathonId: string, input: ReviewInput, userId: string): Promise<Review> {
    const { data } = await client()
      .from("reviews")
      .insert({
        hackathon_id: hackathonId,
        module: input.module,
        module_id: input.moduleId,
        reviewer_id: input.reviewerId,
        author_id: input.authorId,
        title: input.title,
        feedback: input.feedback ?? null,
        created_by: userId,
      } as never)
      .select()
      .single() as never;

    return data as unknown as Review;
  }

  async function updateReviewStatus(id: string, status: ReviewStatus, feedback?: string): Promise<void> {
    const update: Record<string, unknown> = { status };
    if (feedback !== undefined) update.feedback = feedback;
    await client()
      .from("reviews")
      .update(update as never)
      .eq("id", id) as never;
  }

  async function getPendingReviews(userId: string): Promise<Review[]> {
    const { data } = await client()
      .from("reviews")
      .select("*")
      .eq("reviewer_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    return ((data ?? []) as Record<string, unknown>[]).map(mapReviewRow);
  }

  async function getMyRequests(userId: string): Promise<ReviewRequest[]> {
    const { data } = await client()
      .from("review_requests")
      .select("*")
      .eq("requested_by", userId)
      .order("created_at", { ascending: false });

    return ((data ?? []) as Record<string, unknown>[]).map(mapRequestRow);
  }

  async function getIncomingRequests(userId: string): Promise<ReviewRequest[]> {
    const { data } = await client()
      .from("review_requests")
      .select("*")
      .eq("requested_reviewer_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    return ((data ?? []) as Record<string, unknown>[]).map(mapRequestRow);
  }

  async function createRequest(input: {
    hackathonId: string;
    module: string;
    moduleId: string;
    requestedBy: string;
    requestedReviewerId: string;
    message?: string;
  }): Promise<ReviewRequest> {
    const { data } = await client()
      .from("review_requests")
      .insert({
        hackathon_id: input.hackathonId,
        module: input.module,
        module_id: input.moduleId,
        requested_by: input.requestedBy,
        requested_reviewer_id: input.requestedReviewerId,
        message: input.message ?? null,
      } as never)
      .select()
      .single() as never;

    return data as unknown as ReviewRequest;
  }

  async function respondToRequest(requestId: string, status: "accepted" | "declined"): Promise<void> {
    await client()
      .from("review_requests")
      .update({ status } as never)
      .eq("id", requestId) as never;
  }

  return { getReviews, createReview, updateReviewStatus, getPendingReviews, getMyRequests, getIncomingRequests, createRequest, respondToRequest };
}

function mapReviewRow(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    hackathonId: row.hackathon_id as string,
    module: row.module as string,
    moduleId: row.module_id as string,
    status: row.status as ReviewStatus,
    reviewerId: row.reviewer_id as string,
    authorId: row.author_id as string,
    title: row.title as string,
    feedback: row.feedback as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapRequestRow(row: Record<string, unknown>): ReviewRequest {
  return {
    id: row.id as string,
    reviewId: row.review_id as string | null,
    hackathonId: row.hackathon_id as string,
    module: row.module as string,
    moduleId: row.module_id as string,
    requestedBy: row.requested_by as string,
    requestedReviewerId: row.requested_reviewer_id as string,
    status: row.status as "pending" | "accepted" | "declined" | "completed",
    message: row.message as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
