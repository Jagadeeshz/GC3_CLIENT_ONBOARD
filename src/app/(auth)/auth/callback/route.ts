import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getDashboardPath(role: string): string {
  if (role === "client") return "/client/dashboard";
  return "/dashboard";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role || "client";
        return NextResponse.redirect(`${origin}${getDashboardPath(role)}`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }

    console.error("[Auth Callback] exchangeCodeForSession failed:", error.message);
  } else {
    console.error("[Auth Callback] No code parameter in callback URL");
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
