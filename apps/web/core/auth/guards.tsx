import type { Permission } from "@/core/permissions";
import type { WorkspaceRole } from "@/core/workspace";

export type AccessLevel =
  | "public"
  | "authenticated"
  | "owner"
  | "lead"
  | "member"
  | "guest"
  | "permission";

export interface RouteGuard {
  level: AccessLevel;
  permission?: Permission;
  roles?: WorkspaceRole[];
  redirectTo?: string;
}

export interface GuardResult {
  allowed: boolean;
  redirectTo?: string;
  reason?: string;
}

export function checkAccess(
  guard: RouteGuard,
  context: {
    isAuthenticated: boolean;
    role: WorkspaceRole | null;
    hasPermission: (p: Permission) => boolean;
  },
): GuardResult {
  if (guard.level === "public") {
    return { allowed: true };
  }

  if (!context.isAuthenticated) {
    return {
      allowed: false,
      redirectTo: guard.redirectTo ?? "/auth/login",
      reason: "Authentication required",
    };
  }

  if (guard.level === "authenticated") {
    return { allowed: true };
  }

  if (guard.roles && context.role) {
    const roleHierarchy: WorkspaceRole[] = ["guest", "member", "lead", "owner"];
    const userIdx = roleHierarchy.indexOf(context.role);
    const requiredIdx = Math.max(
      ...guard.roles.map((r) => roleHierarchy.indexOf(r)),
    );
    if (userIdx < requiredIdx) {
      return {
        allowed: false,
        redirectTo: guard.redirectTo ?? "/403",
        reason: "Insufficient role",
      };
    }
  }

  if (guard.level === "permission" && guard.permission) {
    if (!context.hasPermission(guard.permission)) {
      return {
        allowed: false,
        redirectTo: guard.redirectTo ?? "/403",
        reason: "Missing permission",
      };
    }
  }

  return { allowed: true };
}
