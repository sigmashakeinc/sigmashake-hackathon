export interface Retrospective {
  id: string;
  archiveId: string;
  wentWell: string[];
  wentBadly: string[];
  problems: string[];
  successes: string[];
  improvements: string[];
  teamFeedback: string | null;
  technicalFeedback: string | null;
  planningFeedback: string | null;
  submissionFeedback: string | null;
  overallScore: number | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RetrospectiveInput {
  wentWell?: string[];
  wentBadly?: string[];
  problems?: string[];
  successes?: string[];
  improvements?: string[];
  teamFeedback?: string;
  technicalFeedback?: string;
  planningFeedback?: string;
  submissionFeedback?: string;
  overallScore?: number;
}
