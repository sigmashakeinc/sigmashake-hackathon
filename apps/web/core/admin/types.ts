export interface PlatformConfig {
  id: string;
  ownerId: string;
  platformName: string;
  version: string;
  deployedAt: string;
  initialized: boolean;
  updatedAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  module: string;
  details: Record<string, unknown>;
  severity: "info" | "warning" | "error" | "success";
  ipAddress: string | null;
  createdAt: string;
}

export interface AdminDashboard {
  platformHealth: "healthy" | "warning" | "error";
  platformVersion: string;
  deploymentEnvironment: string;
  activeHackathon: string | null;
  activeHackathonId: string | null;
  connectedIntegrations: number;
  integrationErrors: number;
  automationRules: number;
  automationFailed: number;
  automationDisabled: number;
  automationRunCount: number;
  storageUsed: string;
  storagePct: number;
  databaseStatus: "healthy" | "warning" | "error";
  databaseSize: string;
  recentErrors: number;
  totalMembers: number;
  totalInvitations: number;
  totalHackathons: number;
}

export interface PlatformInfo {
  platformName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  deployedAt: string;
  version: string;
  initialized: boolean;
}

export interface MembersOverview {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  githubConnected: boolean;
  lastLogin: string | null;
  invitedAt: string | null;
  joinedAt: string | null;
  active: boolean;
}

export interface InvitationOverview {
  id: string;
  code: string;
  email: string | null;
  role: string;
  uses: number;
  maxUses: number | null;
  expiresAt: string | null;
  status: "active" | "expired" | "revoked" | "used";
  createdBy: string;
  createdAt: string;
}

export interface StorageOverview {
  bucketUsage: { bucket: string; size: number; count: number }[];
  totalSize: number;
  totalFiles: number;
  largestFiles: { name: string; size: number; id: string }[];
  orphanedCount: number;
  unusedCount: number;
}

export interface DatabaseOverview {
  migrationVersion: string;
  tableCounts: { table: string; count: number }[];
  indexCount: number;
  databaseSize: string;
  rlsStatus: { table: string; rlsEnabled: boolean }[];
  healthy: boolean;
}

export interface MaintenanceTask {
  id: string;
  label: string;
  description: string;
  action: string;
  run: () => Promise<{ success: boolean; message: string }>;
}

export interface DiagnosticResult {
  check: string;
  status: "healthy" | "warning" | "error";
  message: string;
  details?: Record<string, unknown>;
}

export interface DiagnosticsReport {
  database: DiagnosticResult;
  storage: DiagnosticResult;
  auth: DiagnosticResult;
  github: DiagnosticResult;
  automation: DiagnosticResult;
  relationships: DiagnosticResult;
  notifications: DiagnosticResult;
  search: DiagnosticResult;
  archive: DiagnosticResult;
  healthy: number;
  warnings: number;
  errors: number;
}

export interface AdminLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  module: string;
  details: Record<string, unknown>;
  severity: "info" | "warning" | "error" | "success";
  createdAt: string;
}
