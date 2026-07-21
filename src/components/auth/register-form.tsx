"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

export function RegisterForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
        <CardTitle className="text-2xl font-bold">Invitation Only</CardTitle>
        <CardDescription>
          New accounts are created by invitation only. Please contact your administrator to get access to GC³ Portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Link href="/login">
          <Button variant="outline">Back to Sign In</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
