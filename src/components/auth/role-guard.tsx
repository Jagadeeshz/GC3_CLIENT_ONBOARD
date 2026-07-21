"use client";

import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types";
import { hasPermission } from "@/lib/rbac/guards";
import type { Resource, Action } from "@/lib/rbac/permissions";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole | UserRole[];
  resource?: Resource;
  action?: Action;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  resource,
  action,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  if (resource && action) {
    if (!hasPermission(user.role, resource, action)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

interface ShowForRolesProps {
  children: React.ReactNode;
  roles: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function ShowForRoles({ children, roles, fallback = null }: ShowForRolesProps) {
  const { user } = useAuth();
  if (!user) return <>{fallback}</>;
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return allowedRoles.includes(user.role) ? <>{children}</> : <>{fallback}</>;
}

interface ShowForPermissionProps {
  children: React.ReactNode;
  resource: Resource;
  action: Action;
  fallback?: React.ReactNode;
}

export function ShowForPermission({
  children,
  resource,
  action,
  fallback = null,
}: ShowForPermissionProps) {
  const { user } = useAuth();
  if (!user) return <>{fallback}</>;
  return hasPermission(user.role, resource, action) ? (
    <>{children}</>
  ) : (
    <>{fallback}</>
  );
}
