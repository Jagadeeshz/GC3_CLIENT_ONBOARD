import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your access method
        </p>
      </div>

      <div className="grid gap-4">
        <Link href="/login/client" className="block group">
          <Card className="glass-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20">
                <Mail className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Partner With Us</CardTitle>
                <CardDescription>
                  Magic link sign-in for clients &amp; partners
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/login/staff" className="block group">
          <Card className="glass-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20">
                <Shield className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Team Hub</CardTitle>
                <CardDescription>
                  Secure access for internal staff
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
