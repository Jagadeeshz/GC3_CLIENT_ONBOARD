"use client";

import { WorkspaceMembersSettings } from "@/components/settings/workspace-members";

export default function TeamMembersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s team members and points of contact
        </p>
      </div>
      <WorkspaceMembersSettings />
    </div>
  );
}
