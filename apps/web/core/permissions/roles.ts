import type { Permission, RoleDefinition } from "./types";

export const defaultRoles: RoleDefinition[] = [
  {
    name: "owner",
    description: "Full access to the hackathon workspace",
    permissions: [
      "workspace:view",
      "workspace:manage",
      "workspace:archive",
      "workspace:view-members",
      "members:invite",
      "members:remove",
      "members:manage",
      "planning:view",
      "planning:manage",
      "ideas:view",
      "ideas:create",
      "ideas:vote",
      "ideas:edit",
      "ideas:delete",
      "ideas:manage",
      "tasks:view",
      "tasks:create",
      "tasks:assign",
      "tasks:edit",
      "tasks:delete",
      "tasks:manage",
      "research:view",
      "research:create",
      "research:edit",
      "research:delete",
      "research:manage",
      "files:view",
      "files:upload",
      "files:delete",
      "files:manage",
      "submissions:view",
      "submissions:create",
      "submissions:edit",
      "submissions:delete",
      "submissions:manage",
      "judging:view",
      "judging:score",
    ],
  },
  {
    name: "lead",
    description: "Manage tasks, planning, and team within the hackathon",
    permissions: [
      "workspace:view",
      "workspace:view-members",
      "members:invite",
      "planning:view",
      "planning:manage",
      "ideas:view",
      "ideas:create",
      "ideas:vote",
      "ideas:edit",
      "tasks:view",
      "tasks:create",
      "tasks:assign",
      "tasks:edit",
      "tasks:delete",
      "research:view",
      "research:create",
      "research:edit",
      "files:view",
      "files:upload",
      "files:delete",
      "submissions:view",
      "submissions:create",
      "submissions:edit",
      "judging:view",
      "judging:score",
    ],
  },
  {
    name: "member",
    description: "Standard participant in the hackathon",
    permissions: [
      "workspace:view",
      "workspace:view-members",
      "planning:view",
      "ideas:view",
      "ideas:create",
      "ideas:vote",
      "tasks:view",
      "tasks:create",
      "tasks:edit",
      "research:view",
      "research:create",
      "files:view",
      "files:upload",
      "submissions:view",
      "submissions:create",
      "submissions:edit",
      "judging:view",
    ],
  },
  {
    name: "guest",
    description: "Limited read-only access",
    permissions: [
      "workspace:view",
      "workspace:view-members",
      "planning:view",
      "ideas:view",
      "ideas:vote",
      "tasks:view",
      "research:view",
      "submissions:view",
      "files:view",
    ],
    isDefault: true,
  },
];

export function getRole(name: string): RoleDefinition | undefined {
  return defaultRoles.find((r) => r.name === name);
}

export function hasPermission(
  roleName: string,
  permission: Permission,
): boolean {
  const role = getRole(roleName);
  if (!role) return false;
  return role.permissions.includes(permission);
}

export function hasAnyPermission(
  roleName: string,
  ...permissions: Permission[]
): boolean {
  const role = getRole(roleName);
  if (!role) return false;
  return permissions.some((p) => role.permissions.includes(p));
}

export function hasAllPermissions(
  roleName: string,
  ...permissions: Permission[]
): boolean {
  const role = getRole(roleName);
  if (!role) return false;
  return permissions.every((p) => role.permissions.includes(p));
}
