import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, KeyRound } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Sign In</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your login method
        </p>
      </div>

      <div className="grid gap-4">
        <Link href="/login/client" className="block">
          <Card className="transition-colors hover:border-primary hover:bg-primary/5">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Client Login</CardTitle>
                <CardDescription>
                  Magic link — no password needed
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/login/staff" className="block">
          <Card className="transition-colors hover:border-primary hover:bg-primary/5">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Staff Login</CardTitle>
                <CardDescription>
                  Email and password authentication
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
