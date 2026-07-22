"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function getDashboardPath(role: string): string {
  if (role === "client") return "/client/dashboard";
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

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const userRole = user.user_metadata?.role;
            const clientId = user.user_metadata?.client_id;

            if (userRole && clientId) {
              await supabase
                .from("profiles")
                .update({ role: userRole })
                .eq("id", user.id);

              const { data: existingMember } = await supabase
                .from("workspace_members")
                .select("id")
                .eq("profile_id", user.id)
                .eq("client_id", clientId)
                .single();

              if (!existingMember) {
                await supabase.from("workspace_members").insert({
                  profile_id: user.id,
                  client_id: clientId,
                  role: user.user_metadata?.workspace_role || "viewer",
                  department: user.user_metadata?.department || null,
                  invited_by: user.user_metadata?.invited_by || null,
                  status: "active",
                });
              }
            }

            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            const role = profile?.role || userRole || "";
            if (next) {
              router.push(next);
            } else {
              router.push(getDashboardPath(role));
            }
          } else {
            if (next) {
              router.push(next);
            } else {
              router.push("/dashboard");
            }
          }
        } else {
          router.push("/?error=verification_failed");
        }
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const userRole = user.user_metadata?.role;
            const clientId = user.user_metadata?.client_id;

            if (userRole && clientId) {
              await supabase
                .from("profiles")
                .update({ role: userRole })
                .eq("id", user.id);

              const { data: existingMember } = await supabase
                .from("workspace_members")
                .select("id")
                .eq("profile_id", user.id)
                .eq("client_id", clientId)
                .single();

              if (!existingMember) {
                await supabase.from("workspace_members").insert({
                  profile_id: user.id,
                  client_id: clientId,
                  role: user.user_metadata?.workspace_role || "viewer",
                  department: user.user_metadata?.department || null,
                  invited_by: user.user_metadata?.invited_by || null,
                  status: "active",
                });
              }
            }

            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            const role = profile?.role || userRole || "";
            if (next) {
              router.push(next);
            } else {
              router.push(getDashboardPath(role));
            }
          } else {
            if (next) {
              router.push(next);
            } else {
              router.push("/dashboard");
            }
          }
        } else {
          router.push("/?error=exchange_failed");
        }
      } else {
        router.push("/");
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
