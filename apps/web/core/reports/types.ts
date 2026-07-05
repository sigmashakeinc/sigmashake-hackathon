export interface ReportSection {
  title: string;
  content: string;
  metrics: Record<string, unknown>;
}

export interface Report {
  id: string;
  hackathonId: string;
  reportType: ReportType;
  title: string;
  summary: string;
  sections: ReportSection[];
  generatedAt: string;
  generatedBy: string;
}

export type ReportType =
  | "executive_summary"
  | "planning"
  | "tasks"
  | "submission"
  | "team"
  | "discovery"
  | "workspace_health";

export type ExportFormat = "pdf" | "csv" | "json";

export interface ReportExport {
  id: string;
  hackathonId: string;
  reportType: ReportType;
  format: ExportFormat;
  data: Record<string, unknown>;
  fileUrl: string | null;
  status: "pending" | "completed" | "failed";
  createdBy: string;
  createdAt: string;
}

export const REPORT_LABELS: Record<ReportType, string> = {
  executive_summary: "Executive Summary",
  planning: "Planning Report",
  tasks: "Task Report",
  submission: "Submission Report",
  team: "Team Report",
  discovery: "Discovery Report",
  workspace_health: "Workspace Health Report",
};
