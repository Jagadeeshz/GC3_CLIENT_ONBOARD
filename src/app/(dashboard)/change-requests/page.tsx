"use client";

import { ChangeRequestList } from "@/components/change-requests/change-request-list";

export default function ChangeRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Change Requests</h1>
        <p className="text-muted-foreground">Manage change requests for ongoing projects</p>
      </div>
      <ChangeRequestList />
    </div>
  );
}
