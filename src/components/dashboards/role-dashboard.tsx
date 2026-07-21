"use client";

import { useAuth } from "@/hooks/use-auth";
import { PodMemberDashboard } from "@/components/dashboards/pod-member-dashboard";
import { PodManagerDashboard } from "@/components/dashboards/pod-manager-dashboard";
import { CPIUDashboard } from "@/components/dashboards/cpiu-dashboard";
import { OperationsDashboard } from "@/components/dashboards/operations-dashboard";
import { LeadershipDashboard } from "@/components/dashboards/leadership-dashboard";
import { Loader2 } from "lucide-react";

export function RoleDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  switch (user.role) {
    case "pod_member":
      return <PodMemberDashboard />;
    case "pod_manager":
      return <PodManagerDashboard />;
    case "cpiu":
      return <CPIUDashboard />;
    case "operations_team":
      return <OperationsDashboard />;
    case "leadership":
      return <LeadershipDashboard />;
    default:
      return <LeadershipDashboard />;
  }
}
