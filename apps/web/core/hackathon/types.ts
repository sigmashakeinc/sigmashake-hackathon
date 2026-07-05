export type HackathonStatus =
  | "draft"
  | "upcoming"
  | "active"
  | "submission"
  | "judging"
  | "completed"
  | "archived";

export interface Hackathon {
  id: string;
  name: string;
  slug: string;
  organizer: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  submissionDeadline: string | null;
  timezone: string;
  website: string | null;
  devpostUrl: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: HackathonStatus;
  rules: string | null;
  prizes: string | null;
  tracks: string | null;
  sponsors: string | null;
  submissionRequirements: string | null;
  importantLinks: string | null;
  resources: string | null;
  createdAt: string;
  updatedAt: string;
}

export type HackathonInput = {
  name: string;
  organizer: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  submissionDeadline?: string;
  timezone?: string;
  website?: string;
  devpostUrl?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  status?: HackathonStatus;
  rules?: string;
  prizes?: string;
  tracks?: string;
  sponsors?: string;
  submissionRequirements?: string;
  importantLinks?: string;
  resources?: string;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
