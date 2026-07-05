export const TRIGGER_TYPES = [
  "task_created", "task_completed", "task_assigned", "task_blocked", "task_overdue",
  "idea_approved", "idea_rejected",
  "research_verified", "research_deprecated",
  "objective_completed", "milestone_completed", "deliverable_completed",
  "submission_ready", "submission_locked",
  "workspace_created", "workspace_archived",
  "member_joined", "member_left",
  "invitation_accepted",
  "review_requested", "review_approved", "review_rejected",
  "comment_added", "mention_created",
  "github_sync_completed", "integration_failed",
] as const;

export type TriggerType = typeof TRIGGER_TYPES[number];

export const ACTION_TYPES = [
  "create_notification", "create_activity", "send_reminder",
  "assign_user", "create_task", "create_note",
  "request_review", "update_status", "archive_workspace",
  "create_relationship", "log_event",
] as const;

export type ActionType = typeof ACTION_TYPES[number];

export type RuleMode = "automatic" | "manual";
export type RunStatus = "pending" | "running" | "completed" | "failed" | "skipped";
export type LogLevel = "info" | "warning" | "error" | "debug";

export interface AutomationRule {
  id: string;
  hackathonId: string;
  name: string;
  description: string | null;
  triggerType: TriggerType;
  triggerConfig: Record<string, unknown>;
  actionType: ActionType;
  actionConfig: Record<string, unknown>;
  enabled: boolean;
  mode: RuleMode;
  runCount: number;
  lastRunAt: string | null;
  sortOrder: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string | null;
  triggerType: TriggerType;
  triggerConfig: Record<string, unknown>;
  actionType: ActionType;
  actionConfig: Record<string, unknown>;
  category: string;
  builtIn: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface AutomationRun {
  id: string;
  ruleId: string;
  hackathonId: string;
  triggerType: TriggerType;
  actionType: ActionType;
  status: RunStatus;
  triggerData: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  createdAt: string;
}

export interface AutomationLog {
  id: string;
  runId: string | null;
  ruleId: string;
  level: LogLevel;
  message: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  task_created: "Task Created",
  task_completed: "Task Completed",
  task_assigned: "Task Assigned",
  task_blocked: "Task Blocked",
  task_overdue: "Task Overdue",
  idea_approved: "Idea Approved",
  idea_rejected: "Idea Rejected",
  research_verified: "Research Verified",
  research_deprecated: "Research Deprecated",
  objective_completed: "Objective Completed",
  milestone_completed: "Milestone Completed",
  deliverable_completed: "Deliverable Completed",
  submission_ready: "Submission Ready",
  submission_locked: "Submission Locked",
  workspace_created: "Workspace Created",
  workspace_archived: "Workspace Archived",
  member_joined: "Member Joined",
  member_left: "Member Left",
  invitation_accepted: "Invitation Accepted",
  review_requested: "Review Requested",
  review_approved: "Review Approved",
  review_rejected: "Review Rejected",
  comment_added: "Comment Added",
  mention_created: "Mention Created",
  github_sync_completed: "GitHub Sync Completed",
  integration_failed: "Integration Failed",
};

export const ACTION_LABELS: Record<ActionType, string> = {
  create_notification: "Create Notification",
  create_activity: "Log Activity",
  send_reminder: "Send Reminder",
  assign_user: "Assign User",
  create_task: "Create Task",
  create_note: "Create Note",
  request_review: "Request Review",
  update_status: "Update Status",
  archive_workspace: "Archive Workspace",
  create_relationship: "Create Relationship",
  log_event: "Log Event",
};
