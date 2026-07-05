export type IntegrationType = "github" | string;
export type AuthMethod = "oauth" | "pat" | "apikey" | "none";
export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
export type HealthStatus = "healthy" | "warning" | "error" | "unknown";
export type ValidationResult = "passed" | "failed" | "warning" | "skipped";
export type LogLevel = "info" | "warning" | "error" | "debug";

export interface IntegrationConnection {
  id: string;
  hackathonId: string;
  integrationType: IntegrationType;
  label: string;
  authMethod: AuthMethod;
  status: ConnectionStatus;
  metadata: Record<string, unknown>;
  enabledFeatures: Record<string, boolean>;
  healthScore: number;
  lastValidatedAt: string | null;
  lastSyncedAt: string | null;
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationHealth {
  id: string;
  connectionId: string;
  status: HealthStatus;
  score: number;
  checks: Record<string, unknown>;
  details: Record<string, unknown>;
  checkedAt: string;
}

export interface IntegrationLog {
  id: string;
  connectionId: string;
  level: LogLevel;
  message: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface IntegrationValidation {
  id: string;
  connectionId: string;
  validationType: string;
  result: ValidationResult;
  message: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface IntegrationDefinition {
  type: IntegrationType;
  label: string;
  description: string;
  icon: string;
  authMethods: AuthMethod[];
  features: { key: string; label: string; description: string }[];
  docsUrl?: string;
}

export const INTEGRATION_DEFINITIONS: IntegrationDefinition[] = [
  {
    type: "github",
    label: "GitHub",
    description: "Link repositories, track issues, pull requests, commits, Actions workflows and releases.",
    icon: "code",
    authMethods: ["oauth", "pat"],
    features: [
      { key: "issues", label: "Issues", description: "Read issues" },
      { key: "pulls", label: "Pull Requests", description: "Read pull requests" },
      { key: "actions", label: "Actions", description: "Workflow runs" },
      { key: "releases", label: "Releases", description: "Releases" },
      { key: "commits", label: "Commits", description: "Recent commits" },
    ],
    docsUrl: "https://docs.github.com/en/authentication",
  },
];
