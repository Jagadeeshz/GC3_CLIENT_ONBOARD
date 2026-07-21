"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <ShieldX className="h-16 w-16 text-destructive" />
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter">Access Denied</h1>
        <p className="max-w-md text-muted-foreground">
          You don&apos;t have permission to access this page. Please contact
          your administrator if you believe this is an error.
        </p>
      </div>
      <Link href="/dashboard">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  );
}
