"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/types";
import { hasPermission } from "@/lib/rbac/guards";
import type { Resource, Action } from "@/lib/rbac/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: {
    resource: Resource;
    action: Action;
  };
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">403</h1>
            <p className="mt-2 text-muted-foreground">
              You don&apos;t have permission to access this page.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 text-primary hover:underline"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  if (requiredPermission) {
    if (!hasPermission(user.role, requiredPermission.resource, requiredPermission.action)) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">403</h1>
            <p className="mt-2 text-muted-foreground">
              You don&apos;t have permission to access this resource.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 text-primary hover:underline"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
