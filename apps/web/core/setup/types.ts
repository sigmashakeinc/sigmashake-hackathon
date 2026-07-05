export type SetupStep = "welcome" | "key" | "platform" | "owner" | "review" | "complete";

export interface PlatformSetupInput {
  platformName: string;
  description?: string;
  timezone: string;
  defaultLocale: string;
}

export interface OwnerSetupInput {
  displayName: string;
  username: string;
  email: string;
  password: string;
}
