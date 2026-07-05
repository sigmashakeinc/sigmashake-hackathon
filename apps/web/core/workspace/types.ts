export type WorkspaceStatus = "active" | "archived" | "frozen";

export type WorkspaceRole = "owner" | "lead" | "member" | "guest";

export interface WorkspaceSettings {
  maxMembers: number;
  allowGuestAccess: boolean;
  requireInvite: boolean;
}

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  invitedBy?: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  hackathonId: string;
  status: WorkspaceStatus;
  members: WorkspaceMember[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
