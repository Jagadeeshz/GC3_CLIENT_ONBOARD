"use client";

import { VersionHistory } from "@/components/deliverables/version-history";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const MOCK_VERSIONS = [
  {
    version: 5,
    submittedAt: "2026-07-21T10:30:00Z",
    submittedBy: "Sarah Johnson",
    fileName: "brand-guidelines-v5-final.pdf",
    fileSize: "4.2 MB",
    status: "approved" as const,
    notes: "Final version incorporating all feedback from leadership review. Updated color palette and typography specs.",
  },
  {
    version: 4,
    submittedAt: "2026-07-14T16:45:00Z",
    submittedBy: "Sarah Johnson",
    fileName: "brand-guidelines-v4-revised.pdf",
    fileSize: "3.8 MB",
    status: "revision_requested" as const,
    notes: "Revisions needed: expand secondary color usage guidelines and add digital asset specifications.",
  },
  {
    version: 3,
    submittedAt: "2026-07-07T09:15:00Z",
    submittedBy: "Mike Chen",
    fileName: "brand-guidelines-v3.pdf",
    fileSize: "3.5 MB",
    status: "revision_requested" as const,
    notes: "Good progress but needs additional brand voice documentation and social media templates.",
  },
  {
    version: 2,
    submittedAt: "2026-06-28T14:20:00Z",
    submittedBy: "Mike Chen",
    fileName: "brand-guidelines-v2-draft.pdf",
    fileSize: "2.9 MB",
    status: "revision_requested" as const,
    notes: "First revision addressing initial feedback. Added logo usage rules and spacing requirements.",
  },
  {
    version: 1,
    submittedAt: "2026-06-20T11:00:00Z",
    submittedBy: "Mike Chen",
    fileName: "brand-guidelines-v1-initial.pdf",
    fileSize: "2.1 MB",
    status: "submitted" as const,
    notes: "Initial draft of brand identity guidelines. Covers logo, colors, and basic typography.",
  },
];

export default function DeliverableVersionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/deliverables">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Version History</h1>
          <p className="text-muted-foreground">
            Complete revision history for this deliverable
          </p>
        </div>
      </div>

      <VersionHistory
        deliverableTitle="Brand Identity Guidelines"
        currentVersion={5}
        versions={MOCK_VERSIONS}
      />
    </div>
  );
}
