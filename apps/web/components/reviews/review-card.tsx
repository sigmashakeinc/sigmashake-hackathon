"use client";

import { useState } from "react";
import type { Review, ReviewStatus } from "@/core/reviews";

interface ReviewCardProps {
  review: Review;
  onUpdateStatus: (id: string, status: ReviewStatus, feedback?: string) => Promise<void>;
  isReviewer?: boolean;
}

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pending",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

const STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: "text-[#d29922]",
  changes_requested: "text-primary",
  approved: "text-[#3fb950]",
  rejected: "text-error",
  completed: "text-on-surface-variant",
};

export function ReviewCard({ review, onUpdateStatus, isReviewer }: ReviewCardProps) {
  const [feedback, setFeedback] = useState(review.feedback ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleAction(status: ReviewStatus) {
    setSubmitting(true);
    await onUpdateStatus(review.id, status, feedback);
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <span className={`material-symbols-outlined text-[16px] ${STATUS_COLORS[review.status]}`}>
            {review.status === "approved" ? "check_circle" : review.status === "rejected" ? "cancel" : review.status === "changes_requested" ? "edit" : "hourglass_empty"}
          </span>
          <span className="text-body-sm font-medium text-on-surface">{review.title}</span>
        </div>
        <span className={`font-mono text-[9px] font-medium ${STATUS_COLORS[review.status]}`}>
          {STATUS_LABELS[review.status]}
        </span>
      </div>

      <div className="flex items-center gap-sm font-mono text-[9px] text-on-surface-variant">
        <span>Reviewer: {review.reviewerId.slice(0, 8)}</span>
        <span>Author: {review.authorId.slice(0, 8)}</span>
        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Add feedback..."
        rows={2}
        className="w-full rounded border border-outline-variant/20 bg-black px-sm py-xs text-body-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-none"
        aria-label="Review feedback"
      />

      {isReviewer && review.status === "pending" && (
        <div className="flex flex-wrap gap-xs">
          <button type="button" onClick={() => handleAction("approved")} disabled={submitting} className="rounded bg-[#3fb950] px-sm py-xs text-body-xs font-medium text-white transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-50">Approve</button>
          <button type="button" onClick={() => handleAction("changes_requested")} disabled={submitting} className="rounded border border-outline-variant/30 px-sm py-xs text-body-xs text-on-surface transition-colors hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-50">Changes</button>
          <button type="button" onClick={() => handleAction("rejected")} disabled={submitting} className="rounded bg-error px-sm py-xs text-body-xs font-medium text-white transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-50">Reject</button>
        </div>
      )}
    </div>
  );
}
