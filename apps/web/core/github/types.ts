export type AuthType = "oauth" | "pat";

export interface GitHubConnection {
  id: string;
  hackathonId: string;
  authType: AuthType;
  accessToken: string;
  encryptedToken: string | null;
  tokenOwner: string | null;
  scopes: string | null;
  connectedAt: string;
  lastValidatedAt: string | null;
  createdBy: string;
}

export interface GitHubRepository {
  id: string;
  connectionId: string;
  hackathonId: string;
  fullName: string;
  owner: string;
  name: string;
  description: string | null;
  visibility: string | null;
  defaultBranch: string;
  primaryLanguage: string | null;
  licenseInfo: string | null;
  fork: boolean;
  stars: number;
  forks: number;
  openIssuesCount: number;
  latestReleaseTag: string | null;
  latestReleaseUrl: string | null;
  topics: string[];
  homepage: string | null;
  archived: boolean;
  disabled: boolean;
  isActive: boolean;
  metadata: Record<string, unknown>;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  labels: { name: string; color: string }[];
  milestone: string | null;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface GitHubPR {
  number: number;
  title: string;
  state: string;
  draft: boolean;
  author: string | null;
  reviewStatus: string;
  mergeable: boolean | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string | null;
  date: string;
  htmlUrl: string;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
  default: boolean;
  lastCommitSha: string;
  lastCommitDate: string;
}

export interface GitHubWorkflow {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  branch: string;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface GitHubRelease {
  tagName: string;
  name: string | null;
  prerelease: boolean;
  publishedAt: string;
  body: string | null;
  htmlUrl: string;
}

export interface GitHubSyncHistory {
  id: string;
  connectionId: string;
  repositoryId: string | null;
  syncType: string;
  status: "running" | "completed" | "failed";
  itemsProcessed: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface ValidationResult {
  valid: boolean;
  owner: string | null;
  repository: string | null;
  scopes: string[];
  errors: string[];
}

export interface SetupGuide {
  platform: "windows" | "linux" | "macos";
  steps: { command: string; label: string }[];
}
