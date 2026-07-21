import type { UserRole } from "@/types";
import {
  ROLE_PERMISSIONS,
  type Resource,
  type Action,
  type Permission,
} from "./permissions";

export function hasPermission(
  userRole: UserRole,
  resource: Resource,
  action: Action
): boolean {
  const permission: Permission = `${resource}:${action}`;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(
  userRole: UserRole,
  resource: Resource,
  actions: Action[]
): boolean {
  return actions.some((action) => hasPermission(userRole, resource, action));
}

export function hasAllPermissions(
  userRole: UserRole,
  resource: Resource,
  actions: Action[]
): boolean {
  return actions.every((action) => hasPermission(userRole, resource, action));
}

export function canAccessResource(
  userRole: UserRole,
  resource: Resource
): boolean {
  return hasPermission(userRole, resource, "read") ||
    hasPermission(userRole, resource, "read_own") ||
    hasPermission(userRole, resource, "read_assigned") ||
    hasPermission(userRole, resource, "manage");
}

export function canManageResource(
  userRole: UserRole,
  resource: Resource
): boolean {
  return hasPermission(userRole, resource, "manage") ||
    hasPermission(userRole, resource, "create");
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === "cpiu" || userRole === "leadership";
}

export function isPodStaff(userRole: UserRole): boolean {
  return userRole === "pod_member" || userRole === "pod_manager";
}

export function isClientOnly(userRole: UserRole): boolean {
  return userRole === "client";
}

export function getDashboardRoute(role?: UserRole): string {
  if (role === "client") {
    return "/client/dashboard";
  }
  if (role === "operations_team") {
    return "/dashboard";
  }
  return "/dashboard";
}

export function getUnauthorizedRoute(): string {
  return "/unauthorized";
}
