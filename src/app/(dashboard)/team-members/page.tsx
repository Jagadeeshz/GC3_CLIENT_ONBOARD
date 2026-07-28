"use client";

import { WorkspaceMembersSettings } from "@/components/settings/workspace-members";
import { useClientRole } from "@/hooks/use-client-role";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function TeamMembersPage() {
  const { canManageTeam, loading } = useClientRole();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!canManageTeam) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s team members
          </p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Access Restricted</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Only the Client Admin can manage team members. Contact your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s team members and their permissions
        </p>
      </div>
      <WorkspaceMembersSettings />
    </div>
  );
}
