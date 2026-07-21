"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseClient(), []);

  useEffect(() => {
    const handleAuth = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const code = searchParams.get("code");

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

          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            const role = profile?.role || "";
            if (role === "client") {
              router.push("/client/dashboard");
            } else {
              router.push("/dashboard");
            }
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/login?error=verification_failed");
        }
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            const role = profile?.role || "";
            if (role === "client") {
              router.push("/client/dashboard");
            } else {
              router.push("/dashboard");
            }
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
