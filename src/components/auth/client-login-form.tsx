"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function ClientLoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [magicLinkSent, setMagicLinkSent] = React.useState(false);
  const [sentEmail, setSentEmail] = React.useState("");
  const searchParams = useSearchParams();
  const supabase = React.useMemo(() => createSupabaseClient(), []);

  const error = searchParams.get("error");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  React.useEffect(() => {
    if (error === "account_deactivated") {
      toast.error("Your account has been deactivated. Please contact support.");
    } else if (error === "session_expired") {
      toast.error("Your session has expired. Please sign in again.");
    } else if (error) {
      toast.error("An authentication error occurred. Please try again.");
    }
  }, [error]);

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      setSentEmail(data.email);
      setMagicLinkSent(true);
      toast.success("Magic link sent! Check your email.");
    } catch {
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We sent a magic link to <span className="font-medium text-foreground">{sentEmail}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            Click the link in your email to sign in. The link will expire in 15 minutes.
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setMagicLinkSent(false);
              setSentEmail("");
            }}
          >
            Use a different email
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Didn&apos;t receive the email?{" "}
            <button
              onClick={() => {
                setMagicLinkSent(false);
                setSentEmail("");
              }}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Client Login</CardTitle>
        <CardDescription>
          Sign in with a secure magic link — no password needed.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
            We&apos;ll send you a secure link to sign in without a password.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending magic link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Magic Link
              </>
            )}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login/staff" className="text-primary hover:underline">
              Staff? Sign in with password
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
