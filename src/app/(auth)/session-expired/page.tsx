"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function SessionExpiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
          <CardTitle className="text-2xl font-bold">Session Expired</CardTitle>
          <CardDescription>
            Your session has expired for security reasons. Please sign in again to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you keep experiencing this issue, try clearing your browser cache or contact support.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button>Sign In Again</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
