export type Role = "admin" | "judge" | "participant";

export type HackathonStatus =
  "draft" | "upcoming" | "active" | "judging" | "completed" | "archived";

export type TeamRole = "lead" | "member";

export type Size = "sm" | "md" | "lg";

export type Variant =
  "primary" | "secondary" | "ghost" | "danger" | "success" | "warning";

export interface Timestamps {
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Identifiable {
  id: string;
}
