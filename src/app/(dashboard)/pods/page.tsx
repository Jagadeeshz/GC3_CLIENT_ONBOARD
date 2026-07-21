"use client";

import { PodList } from "@/components/pods/pod-list";

export default function PodsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pods</h1>
        <p className="text-muted-foreground">Manage pods and team assignments</p>
      </div>
      <PodList />
    </div>
  );
}
