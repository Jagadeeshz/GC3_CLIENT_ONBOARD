"use client";

import { DeliverableList } from "@/components/deliverables/deliverable-list";
import { CreateDeliverableForm } from "@/components/deliverables/create-deliverable-form";

export default function DeliverablesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deliverables</h1>
          <p className="text-muted-foreground">Track deliverables and submissions</p>
        </div>
        <CreateDeliverableForm />
      </div>
      <DeliverableList />
    </div>
  );
}
