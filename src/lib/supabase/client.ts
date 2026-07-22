import { createBrowserClient } from "@supabase/ssr";

const CODE_VERIFIER_KEY = "supabase.auth.token-code-verifier";

/**
 * Seed the PKCE code-verifier cookie from localStorage if it is missing.
 *
 * During a magic-link flow the browser stores the PKCE verifier in a cookie
 * via `signInWithOtp()`.  When the user clicks the link the middleware may
 * rebuild the `NextResponse` (via `setAll`) which can inadvertently drop the
 * cookie before the callback page loads.  Keeping a parallel copy in
 * localStorage lets us restore it.
 */
function seedVerifierFromLocalStorage() {
  try {
    const hasVerifierCookie = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith(CODE_VERIFIER_KEY + "="));
    if (!hasVerifierCookie) {
      const lsVerifier = localStorage.getItem(CODE_VERIFIER_KEY);
      if (lsVerifier) {
        document.cookie = `${CODE_VERIFIER_KEY}=${lsVerifier}; path=/; SameSite=Lax; max-age=${400 * 24 * 60 * 60}`;
      }
    }
  } catch {
    // localStorage may be unavailable (SSR, private browsing, etc.)
  }
}

export function createSupabaseClient() {
  seedVerifierFromLocalStorage();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
