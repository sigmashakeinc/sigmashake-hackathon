export type InvitationStatus =
  "pending" | "active" | "used" | "expired" | "revoked" | "disabled";

export type InvitationRole = "lead" | "member" | "guest";

export interface Invitation {
  id: string;
  hackathonId: string;
  token: string;
  code: string;
  role: InvitationRole;
  status: InvitationStatus;
  maxUses: number;
  currentUses: number;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  revokedAt: string | null;
  revokedBy: string | null;
  lastUsedAt: string | null;
  notes: string | null;
}

export type InviteLinkMode = "code" | "token";

export function buildInviteUrl(
  baseUrl: string,
  token: string,
  code: string,
): { url: string; code: string } {
  return {
    url: `${baseUrl}/join?token=${encodeURIComponent(token)}`,
    code,
  };
}

export const INVITE_EXPIRY_OPTIONS = [
  { label: "1 Hour", value: "1h" },
  { label: "1 Day", value: "24h" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "Never", value: "never" },
] as const;

export const INVITE_ROLE_OPTIONS: { label: string; value: InvitationRole }[] = [
  { label: "Member", value: "member" },
  { label: "Team Lead", value: "lead" },
  { label: "Guest", value: "guest" },
];

export const INVITE_MAX_USES_OPTIONS = [
  { label: "1 use", value: 1 },
  { label: "5 uses", value: 5 },
  { label: "10 uses", value: 10 },
  { label: "Unlimited", value: 999999 },
] as const;
