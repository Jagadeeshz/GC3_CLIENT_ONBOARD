"use client";

import { RequestList } from "@/components/requests/request-list";
import { CreateRequestForm } from "@/components/requests/create-request-form";

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requests</h1>
          <p className="text-muted-foreground">Manage and track your requests</p>
        </div>
        <CreateRequestForm />
      </div>
      <RequestList />
    </div>
  );
}
