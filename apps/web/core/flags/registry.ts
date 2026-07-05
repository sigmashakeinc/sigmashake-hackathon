import type { FeatureFlag, FlagMap } from "./types";

const flags: FlagMap = {
  submissions: {
    key: "submissions",
    description: "Enable the submissions feature",
    status: "active",
    enabled: { development: true, preview: true, production: false },
  },
  judging: {
    key: "judging",
    description: "Enable the judging and scoring feature",
    status: "active",
    enabled: { development: true, preview: true, production: false },
  },
  research: {
    key: "research",
    description: "Enable the research module",
    status: "active",
    enabled: { development: true, preview: true, production: false },
  },
  realtime: {
    key: "realtime",
    description: "Enable real-time collaboration features",
    status: "experimental",
    enabled: { development: true, preview: false, production: false },
  },
  aiAssistant: {
    key: "aiAssistant",
    description: "Enable AI-powered assistance features",
    status: "experimental",
    enabled: { development: true, preview: false, production: false },
  },
  auditLog: {
    key: "auditLog",
    description: "Enable audit logging",
    status: "active",
    enabled: { development: true, preview: true, production: true },
  },
};

export function getFlag(key: string): FeatureFlag | undefined {
  return flags[key];
}

export function isFlagEnabled(
  key: string,
  env: "development" | "preview" | "production" = "development",
): boolean {
  const flag = flags[key];
  if (!flag) return false;
  return flag.enabled[env] === true && flag.status !== "deprecated";
}

export function getAllFlags(): FlagMap {
  return { ...flags };
}

export function getEnabledFlags(
  env: "development" | "preview" | "production" = "development",
): FeatureFlag[] {
  return Object.values(flags).filter((f) => isFlagEnabled(f.key, env));
}
