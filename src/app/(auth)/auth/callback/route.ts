import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // Handle expired or invalid link errors gracefully
  if (error || error_description) {
    console.error("Magic link error:", error, error_description);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description || error || "auth-failed")}`
    );
  }

  // Determine target path (Explicit default: /client/dashboard)
  const next = searchParams.get("next") ?? "/client/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Called from Server Component
            }
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Success -> Redirect directly to Client Dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("PKCE Exchange Error:", exchangeError.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
