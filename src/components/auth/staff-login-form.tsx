"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { getDashboardRoute } from "@/lib/rbac/guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import type { UserRole } from "@/types";

const STAFF_ROLES: { value: UserRole; label: string }[] = [
  { value: "pod_member", label: "Pod Member" },
  { value: "pod_manager", label: "Pod Manager" },
  { value: "cpiu", label: "CPIU" },
  { value: "operations_team", label: "Operations Team" },
  { value: "leadership", label: "Leadership" },
];

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function StaffLoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<UserRole | "">("");
  const [roleError, setRoleError] = React.useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = React.useMemo(() => createSupabaseClient(), []);

  const error = searchParams.get("error");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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

  const onSubmit = async (data: LoginFormData) => {
    if (!selectedRole) {
      setRoleError("Please select your role.");
      return;
    }
    setRoleError(null);
    setIsLoading(true);
    try {
      const { data: result, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          toast.error("Invalid email or password.");
        } else if (authError.message.includes("Email not confirmed")) {
          toast.error("Please confirm your email before signing in.");
        } else {
          toast.error(authError.message);
        }
        return;
      }

      if (result.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", result.user.id)
          .single();

        if (profileError || !profile) {
          await supabase.auth.signOut();
          toast.error("Unable to verify your account. Please try again.");
          return;
        }

        if (profile.role !== selectedRole) {
          await supabase.auth.signOut();
          toast.error("The selected role does not match your assigned account.");
          return;
        }

        toast.success("Welcome back!");
        router.push(getDashboardRoute(profile.role as UserRole));
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Internal Staff Login</CardTitle>
        <CardDescription>
          Sign in to access the GC³ Internal Operations Portal.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Select Your Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => {
                setSelectedRole(value as UserRole);
                setRoleError(null);
              }}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {roleError && (
              <p className="text-sm text-destructive">{roleError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            This portal is restricted to authorized GC³ internal staff.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
