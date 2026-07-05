export type UserStatus = "active" | "inactive" | "suspended";

export interface UserProfile {
  displayName: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface UserPreferences {
  theme: "dark";
  locale: string;
  timezone: string;
  emailNotifications: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface User {
  id: string;
  profile: UserProfile;
  status: UserStatus;
  preferences: UserPreferences;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  deletedAt?: string | null;
}
