export type ActivitySeverity = "info" | "warning" | "error" | "success";

export interface ActivityEvent {
  id: string;
  hackathonId: string | null;
  eventType: string;
  module: string;
  title: string;
  description: string | null;
  actor: string | null;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  severity: ActivitySeverity;
  createdAt: string;
}

export interface ActivityInput {
  eventType: string;
  module: string;
  title: string;
  description?: string;
  actor?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  severity?: ActivitySeverity;
}

export const MODULE_LABELS: Record<string, string> = {
  auth: "Authentication", hackathon: "Hackathon", planning: "Planning",
  ideas: "Ideas", research: "Research", tasks: "Tasks",
  notes: "Notes", files: "Files", submission: "Submission",
  invitations: "Invitations", team: "Team", settings: "Settings",
};

export const MODULE_ICONS: Record<string, string> = {
  auth: "lock", hackathon: "emoji_events", planning: "map",
  ideas: "lightbulb", research: "travel_explore", tasks: "checklist",
  notes: "note", files: "folder", submission: "task_alt",
  invitations: "mail", team: "group", settings: "settings",
};
