import { routes } from "./config";
import type { AccessLevel } from "@/core/auth";

export interface ProtectedRouteConfig {
  level: AccessLevel;
  redirectTo?: string;
}

export const routeAccess: Record<string, ProtectedRouteConfig> = {
  [routes.home]: { level: "public" },
  [routes.auth.login]: { level: "public" },
  [routes.auth.register]: { level: "public" },
  [routes.auth.forgotPassword]: { level: "public" },
  [routes.auth.resetPassword]: { level: "public" },
};

export function getRouteAccess(pathname: string): ProtectedRouteConfig {
  if (pathname.startsWith("/w/")) {
    return { level: "authenticated" };
  }
  if (pathname.startsWith("/settings")) {
    return { level: "authenticated" };
  }
  return routeAccess[pathname] ?? { level: "public" };
}
