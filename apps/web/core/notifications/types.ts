export interface Notification {
  id: string;
  hackathonId: string | null;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  module: string | null;
  link: string | null;
  read: boolean;
  archived: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export const NOTIFICATION_TYPES = [
  "task_assigned", "task_updated", "task_completed", "task_blocked",
  "task_review", "task_due_soon", "task_overdue",
  "idea_created", "idea_approved", "idea_rejected",
  "research_added", "research_verified",
  "relationship_created",
  "invitation_received", "role_changed", "member_joined",
  "submission_deadline",
  "hackathon_registration", "hackathon_start", "hackathon_end",
  "announcement", "system",
] as const;

export const NOTIFICATION_LABELS: Record<string, string> = {
  task_assigned: "Task Assigned", task_updated: "Task Updated",
  task_completed: "Task Completed", task_blocked: "Task Blocked",
  task_review: "Review Requested", task_due_soon: "Due Soon",
  task_overdue: "Overdue", idea_created: "New Idea",
  idea_approved: "Idea Approved", idea_rejected: "Idea Rejected",
  research_added: "Research Added", research_verified: "Research Verified",
  relationship_created: "Link Created",
  invitation_received: "Invitation", role_changed: "Role Changed",
  member_joined: "Member Joined",
  submission_deadline: "Submission Deadline",
  hackathon_registration: "Registration", hackathon_start: "Hackathon Start",
  hackathon_end: "Hackathon End",
  announcement: "Announcement", system: "System",
};

export const NOTIFICATION_ICONS: Record<string, string> = {
  task_assigned: "assignment", task_updated: "edit", task_completed: "check_circle",
  task_blocked: "block", task_review: "rate_review", task_due_soon: "schedule",
  task_overdue: "warning", idea_created: "lightbulb", idea_approved: "thumb_up",
  idea_rejected: "thumb_down", research_added: "travel_explore",
  research_verified: "verified", relationship_created: "hub",
  invitation_received: "mail", role_changed: "badge", member_joined: "person_add",
  submission_deadline: "timer", hackathon_registration: "event",
  hackathon_start: "play_arrow", hackathon_end: "stop",
  announcement: "campaign", system: "settings",
};
