export type ProfileStatus = "online" | "away" | "offline";

export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export interface Profile {
  id: string;
  displayName: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  timezone: string;
  country: string | null;
  pronouns: string | null;
  githubUsername: string | null;
  discordUsername: string | null;
  website: string | null;
  experienceLevel: ExperienceLevel | null;
  status: ProfileStatus;
  lastActiveAt: string | null;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProfileInput = {
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  country?: string;
  pronouns?: string;
  githubUsername?: string;
  discordUsername?: string;
  website?: string;
  experienceLevel?: ExperienceLevel;
};
