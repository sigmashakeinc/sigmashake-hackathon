export interface WorkspaceHealth {
  healthScore: number;
  completionPct: number;
  tasksCompleted: number;
  tasksTotal: number;
  blockedTasks: number;
  overdueTasks: number;
  ideasProgress: number;
  researchProgress: number;
  submissionReadiness: number;
  relationshipsCreated: number;
  filesUploaded: number;
  totalActivity: number;
}

export interface PlanningAnalytics {
  totalObjectives: number;
  completedObjectives: number;
  totalMilestones: number;
  completedMilestones: number;
  avgMilestoneCompletion: number;
  totalRequirements: number;
  completedRequirements: number;
  totalDeliverables: number;
  completedDeliverables: number;
  totalRisks: number;
  mitigatedRisks: number;
  totalDecisions: number;
  acceptedDecisions: number;
}

export interface TaskAnalytics {
  byStatus: Record<string, number>;
  total: number;
  avgCompletionHours: number;
  overdueCount: number;
  avgDifficulty: number;
  completionTrend: { date: string; count: number }[];
  overdueTrend: { date: string; count: number }[];
}

export interface TeamAnalytics {
  memberWorkload: { name: string; assigned: number; completed: number }[];
  totalAssigned: number;
  totalCompleted: number;
  totalReviews: number;
  activityByMember: { name: string; count: number }[];
}

export interface IdeaAnalytics {
  total: number;
  approved: number;
  rejected: number;
  implemented: number;
  totalVotes: number;
  popular: { title: string; votes: number }[];
  votingTrend: { date: string; count: number }[];
}

export interface ResearchAnalytics {
  total: number;
  verified: number;
  deprecated: number;
  byCategory: Record<string, number>;
  mostReferenced: { title: string; references: number }[];
}

export interface FileAnalytics {
  totalSize: number;
  totalFiles: number;
  byCategory: Record<string, number>;
  largest: { name: string; size: number }[];
}

export interface RelationshipAnalytics {
  total: number;
  byType: Record<string, number>;
  mostConnected: { label: string; count: number }[];
  orphaned: number;
}

export interface DiscoveryAnalytics {
  watching: number;
  applied: number;
  accepted: number;
  rejected: number;
  upcoming: number;
}

export interface SubmissionAnalytics {
  deliverablesTotal: number;
  deliverablesComplete: number;
  checklistTotal: number;
  checklistComplete: number;
  readinessPct: number;
  remainingWork: number;
}

export interface AnalyticsSnapshot {
  id: string;
  hackathonId: string;
  snapshotType: string;
  data: Record<string, unknown>;
  summary: Record<string, unknown>;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}
