"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function getDashboardPath(role: string): string {
  if (role === "client") return "/client/dashboard";
  return "/dashboard";
}

async function ensureProfile(supabase: ReturnType<typeof createSupabaseClient>, user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!existing) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      full_name:
        (user.user_metadata?.full_name as string) ??
        (user.user_metadata?.name as string) ??
        user.email?.split("@")[0] ??
        "User",
      role: ((user.user_metadata?.role as string) as "client" | "pod_member" | "pod_manager" | "cpiu" | "leadership" | "operations_team") ?? "client",
      is_active: true,
    });
  }
}

async function handleWorkspaceMember(
  supabase: ReturnType<typeof createSupabaseClient>,
  user: { id: string; user_metadata?: Record<string, unknown> }
) {
  try {
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
  } catch {
    // Workspace operations are best-effort; don't block auth flow
  }
}

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseClient(), []);

  useEffect(() => {
    let cancelled = false;

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

        if (cancelled) return;

        if (!error) {
          if (type === "signup") {
            router.push("/auth/accept-invite");
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            await ensureProfile(supabase, user);
            await handleWorkspaceMember(supabase, user);

            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            const role = profile?.role || (user.user_metadata?.role as string) || "";
            if (!cancelled) {
              router.push(next || getDashboardPath(role));
            }
          } else {
            if (!cancelled) {
              router.push(next || "/dashboard");
            }
          }
        } else {
          if (!cancelled) {
            router.push("/?error=verification_failed");
          }
        }
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (cancelled) return;

        if (!error) {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            await ensureProfile(supabase, user);
            await handleWorkspaceMember(supabase, user);

            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            const role = profile?.role || (user.user_metadata?.role as string) || "";
            if (!cancelled) {
              router.push(next || getDashboardPath(role));
            }
          } else {
            if (!cancelled) {
              router.push(next || "/dashboard");
            }
          }
        } else {
          if (!cancelled) {
            router.push("/?error=exchange_failed");
          }
        }
      } else {
        if (!cancelled) {
          router.push("/");
        }
      }
    };

    handleAuth();

    return () => {
      cancelled = true;
    };
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
