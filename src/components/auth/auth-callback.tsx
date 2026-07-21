"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function getDashboardPath(role: string): string {
  if (role === "client") return "/client/dashboard";
  if (role === "operations_team") return "/operations/dashboard";
  if (role === "pod_member" || role === "pod_manager") return "/pod/dashboard";
  if (role === "cpiu") return "/cpiu/dashboard";
  if (role === "leadership") return "/dashboard";
  return "/dashboard";
}

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseClient(), []);

  useEffect(() => {
    const handleAuth = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const code = searchParams.get("code");
      const next = searchParams.get("next");

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type: type as "signup" | "magiclink",
          token_hash,
        });

        if (!error) {
          if (type === "signup") {
            router.push("/auth/accept-invite");
            return;
          }

          if (next) {
            router.push(next);
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            const role = profile?.role || "";
            router.push(getDashboardPath(role));
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/login?error=verification_failed");
        }
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          if (next) {
            router.push(next);
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            const role = profile?.role || "";
            router.push(getDashboardPath(role));
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/login?error=exchange_failed");
        }
      } else {
        router.push("/login");
      }
    };

    handleAuth();
  }, [searchParams, router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying your account...</p>
      </div>
    </div>
  );
}
