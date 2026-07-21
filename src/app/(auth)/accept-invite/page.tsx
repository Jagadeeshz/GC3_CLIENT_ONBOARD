"use client";

import { Suspense } from "react";
import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { Loader2 } from "lucide-react";

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
