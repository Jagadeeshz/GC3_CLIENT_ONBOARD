"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

const PKCE_VERIFIER_KEY = "gc3-pkce-code-verifier";

async function exchangeViaFetch(code: string, codeVerifier: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=pkce`,
    {
      method: "POST",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ auth_code: code, code_verifier: codeVerifier }),
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") || "/client/dashboard";
    const error = searchParams.get("error");

    if (error) {
      console.error("[Auth Callback] Supabase error:", error);
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code) {
      console.warn("[Auth Callback] No code in URL");
      router.replace("/login");
      return;
    }

    const supabase = createSupabaseClient();

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (!exchangeError) {
          console.log(
            `[Auth Callback] Session established via SDK, redirecting to ${next}`
          );
          router.replace(next);
          return;
        }

        console.warn(
          "[Auth Callback] SDK exchange failed, trying localStorage fallback:",
          exchangeError.message
        );

        let codeVerifier: string | null = null;
        try {
          const raw = localStorage.getItem(PKCE_VERIFIER_KEY);
          if (raw) {
            codeVerifier = JSON.parse(raw);
          }
        } catch {}

        if (!codeVerifier) {
          console.error("[Auth Callback] No PKCE verifier in localStorage");
          setStatus("error");
          setTimeout(() => router.replace("/login?error=session_expired"), 1500);
          return;
        }

        exchangeViaFetch(code, codeVerifier)
          .then((data) => {
            if (data?.access_token && data?.refresh_token) {
              supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
              }).then(({ error }) => {
                if (error) {
                  console.error("[Auth Callback] setSession error:", error.message);
                  setStatus("error");
                  setTimeout(
                    () => router.replace("/login?error=session_expired"),
                    1500
                  );
                } else {
                  console.log(
                    `[Auth Callback] Session established via fetch, redirecting to ${next}`
                  );
                  router.replace(next);
                }
              });
            } else {
              throw new Error("No tokens in response");
            }
          })
          .catch((fetchErr) => {
            console.error("[Auth Callback] Fetch exchange error:", fetchErr);
            setStatus("error");
            setTimeout(
              () => router.replace("/login?error=session_expired"),
              1500
            );
          });
      });
  }, [searchParams, router]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-destructive font-medium">Authentication failed</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
