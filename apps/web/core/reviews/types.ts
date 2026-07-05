export type ReviewStatus = "pending" | "changes_requested" | "approved" | "rejected" | "completed";
export type RequestStatus = "pending" | "accepted" | "declined" | "completed";

export interface Review {
  id: string;
  hackathonId: string;
  module: string;
  moduleId: string;
  status: ReviewStatus;
  reviewerId: string;
  authorId: string;
  title: string;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRequest {
  id: string;
  reviewId: string | null;
  hackathonId: string;
  module: string;
  moduleId: string;
  requestedBy: string;
  requestedReviewerId: string;
  status: RequestStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewInput {
  title: string;
  module: string;
  moduleId: string;
  reviewerId: string;
  authorId: string;
  feedback?: string;
}
