export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.joined"
  | "workspace.created"
  | "workspace.archived"
  | "workspace.settings_updated"
  | "member.invited"
  | "member.joined"
  | "member.removed"
  | "member.role_changed"
  | "task.created"
  | "task.updated"
  | "task.deleted"
  | "task.assigned"
  | "idea.created"
  | "idea.updated"
  | "idea.deleted"
  | "submission.created"
  | "submission.updated"
  | "submission.scored"
  | "file.uploaded"
  | "file.deleted"
  | "hackathon.started"
  | "hackathon.ended";

export type AuditSeverity = "info" | "warning" | "error";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  targetId?: string;
  targetType?: string;
  description: string;
  severity: AuditSeverity;
  metadata: Record<string, unknown>;
  workspaceId?: string;
  timestamp: string;
}
