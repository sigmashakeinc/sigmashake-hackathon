/**
 * Shared TypeScript type definitions.
 * Feature-specific types should be co-located with their feature.
 */

export type Role = "admin" | "judge" | "participant";

export type HackathonStatus =
  "draft" | "upcoming" | "active" | "judging" | "completed" | "archived";

export type TeamRole = "lead" | "member";

export interface Timestamps {
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Identifiable {
  id: string;
}
