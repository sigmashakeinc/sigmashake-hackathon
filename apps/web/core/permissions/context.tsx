"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { defaultRoles, hasPermission } from "./roles";
import type { Permission, RoleDefinition } from "./types";

interface PermissionContextValue {
  role: RoleDefinition | null;
  roleName: string | null;
  can: (permission: Permission) => boolean;
  canAny: (...permissions: Permission[]) => boolean;
  canAll: (...permissions: Permission[]) => boolean;
  roles: RoleDefinition[];
}

const PermissionContext = createContext<PermissionContextValue>({
  role: null,
  roleName: null,
  can: () => false,
  canAny: () => false,
  canAll: () => false,
  roles: defaultRoles,
});

export function PermissionProvider({
  children,
  roleName,
}: {
  children: ReactNode;
  roleName: string | null;
}) {
  const value = useMemo(() => {
    const role = defaultRoles.find((r) => r.name === roleName) ?? null;
    return {
      role,
      roleName,
      can: (permission: Permission) =>
        role ? hasPermission(role.name, permission) : false,
      canAny: (...permissions: Permission[]) =>
        role ? permissions.some((p) => hasPermission(role.name, p)) : false,
      canAll: (...permissions: Permission[]) =>
        role ? permissions.every((p) => hasPermission(role.name, p)) : false,
      roles: defaultRoles,
    };
  }, [roleName]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}
