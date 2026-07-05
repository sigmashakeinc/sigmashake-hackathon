export type ArchiveStatus = "completed" | "cancelled" | "abandoned" | "imported";
export type ArchiveResult = "won" | "placed" | "participated" | "withdrew" | "none";

export interface WorkspaceArchive {
  id: string;
  hackathonId: string;
  name: string;
  slug: string;
  organizer: string;
  status: ArchiveStatus;
  result: ArchiveResult | null;
  placement: string | null;
  prize: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  submissionDeadline: string | null;
  memberCount: number;
  completionPct: number;
  submissionStatus: string | null;
  technology: string | null;
  category: string | null;
  templateOrigin: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  archivedAt: string;
  createdAt: string;
  updatedAt: string;
  lessonCount?: number;
  hasRetrospective?: boolean;
}

export interface WorkspaceSnapshot {
  id: string;
  archiveId: string;
  snapshotType: string;
  data: Record<string, unknown>;
  capturedAt: string;
}

export interface ArchiveTag {
  id: string;
  archiveId: string;
  tag: string;
  category: string;
  createdAt: string;
}

export interface ArchiveStats {
  totalArchived: number;
  wins: number;
  placements: number;
  completedProjects: number;
  avgHealthScore: number;
  avgCompletionPct: number;
  avgSubmissionReadiness: number;
  totalLessons: number;
}
