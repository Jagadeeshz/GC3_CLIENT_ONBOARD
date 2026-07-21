"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, UserCircle } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  company: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function AcceptInviteForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [completedUserRole, setCompletedUserRole] = React.useState<string>("");
  const [isVerifying, setIsVerifying] = React.useState(true);
  const [isValidInvite, setIsValidInvite] = React.useState(false);
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseClient(), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  React.useEffect(() => {
    const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsValidInvite(true);
      } else {
        toast.error("Invalid or expired invitation link. Please request a new one.");
        router.push("/login");
      }
      setIsVerifying(false);
    };

    verifySession();
  }, [supabase, router]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const { error: pwError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (pwError) {
        toast.error(pwError.message);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Session expired. Please sign in.");
        router.push("/login");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone || null,
          company: data.company || null,
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setCompletedUserRole(profile?.role || "client");
      setIsComplete(true);
      toast.success("Profile completed! Welcome to GC³ Portal.");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <Card className="w-full max-w-md glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying your invitation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-success" />
          <CardTitle className="text-2xl font-bold">All Set!</CardTitle>
          <CardDescription>
            Your profile has been completed. Welcome to GC³ Portal.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" onClick={() => {
            router.push(completedUserRole === "client" ? "/client/dashboard" : "/dashboard");
          }}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!isValidInvite) {
    return null;
  }

  return (
    <Card className="w-full max-w-md glass-card">
      <CardHeader className="text-center">
        <UserCircle className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
        <CardDescription>
          Set up your account to get started with GC³ Portal.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              {...register("full_name")}
              disabled={isLoading}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              {...register("phone")}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company (optional)</Label>
            <Input
              id="company"
              placeholder="Acme Corp"
              {...register("company")}
              disabled={isLoading}
            />
          </div>
          <div className="border-t pt-4">
            <p className="mb-4 text-sm font-medium">Set Your Password</p>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="mt-2 space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up account...
              </>
            ) : (
              "Complete Registration"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
