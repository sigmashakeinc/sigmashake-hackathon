export type SubmissionStatus = "draft" | "ready" | "submitted" | "accepted" | "rejected";

export type DeliverableStatus = "incomplete" | "in_progress" | "complete" | "blocked" | "not_required";

export interface Submission {
  id: string;
  hackathonId: string;
  status: SubmissionStatus;
  title: string;
  description: string | null;
  submissionUrl: string | null;
  devpostUrl: string | null;
  githubRepo: string | null;
  liveDemoUrl: string | null;
  videoUrl: string | null;
  presentationUrl: string | null;
  documentationUrl: string | null;
  additionalLinks: Record<string, string> | null;
  notes: string | null;
  locked: boolean;
  submittedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionDeliverable {
  id: string;
  submissionId: string;
  name: string;
  description: string | null;
  status: DeliverableStatus;
  owner: string | null;
  notes: string | null;
  fileId: string | null;
  sortOrder: number;
}

export interface SubmissionChecklistItem {
  id: string;
  submissionId: string;
  label: string;
  checked: boolean;
  blocked: boolean;
  notRequired: boolean;
  sortOrder: number;
}

export const DEFAULT_DELIVERABLES = [
  "Application", "Repository", "Presentation", "Demo Video",
  "Screenshots", "README", "Installation Guide", "License",
  "Pitch Deck", "Documentation",
];

export const DEFAULT_CHECKLIST = [
  "All code committed to repository",
  "README written",
  "License file included",
  "Screenshots taken",
  "Demo video recorded",
  "Presentation prepared",
  "Pitch deck ready",
  "Installation guide written",
  "Dependencies documented",
  "Environment variables documented",
  "Submission form completed",
  "Final review conducted",
];
