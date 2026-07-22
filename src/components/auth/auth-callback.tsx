"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";

function getDashboardPath(role: string): string {
  if (role === "client") return "/client/dashboard";
  return "/dashboard";
}

interface LogEntry {
  step: string;
  status: "info" | "ok" | "error";
  message: string;
  timestamp: string;
}

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const log = useCallback((entry: Omit<LogEntry, "timestamp">) => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 12);
    const full = { ...entry, timestamp };
    const prefix = `[AuthCallback ${timestamp}]`;
    const style =
      entry.status === "error"
        ? "color: red; font-weight: bold"
        : entry.status === "ok"
          ? "color: green; font-weight: bold"
          : "color: cyan";
    console.log(`%c${prefix} [${entry.step}] ${entry.message}`, style);
    setLogs((prev) => [...prev, full]);
  }, []);

  const finalize = useCallback(async (userId: string) => {
    log({ step: "6-profile", status: "info", message: `Looking up profile for user ${userId}...` });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      log({ step: "6-profile", status: "error", message: `Profile query error: ${profileError.message}` });
    }

    const role = profile?.role || "client";
    const redirectPath = getDashboardPath(role);
    log({ step: "7-redirect", status: "ok", message: `Role="${role}" → redirecting to ${redirectPath}` });

    router.push(redirectPath);
  }, [supabase, log, router]);

  useEffect(() => {
    let cancelled = false;

    const handleAuth = async () => {
      // ── Step 1: Mounted ──
      log({ step: "1-mount", status: "info", message: "Callback page mounted" });

      // ── Step 2: URL ──
      log({ step: "2-url", status: "info", message: `URL: ${window.location.href}` });

      // ── Step 3: Params ──
      const allParams: Record<string, string> = {};
      searchParams.forEach((v, k) => { allParams[k] = v; });
      log({ step: "3-params", status: "info", message: `Params: ${JSON.stringify(allParams)}` });

      const code = searchParams.get("code");
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      // ── Step 4: Code ──
      if (code) {
        log({ step: "4-code", status: "ok", message: `code=${code.slice(0, 8)}...${code.slice(-4)}` });
      } else if (token_hash) {
        log({ step: "4-code", status: "info", message: `token_hash present, type=${type}` });
      } else {
        log({ step: "4-code", status: "error", message: "No code or token_hash in URL" });
        setFatalError("No authentication code found in the callback URL. The link may have expired.");
        return;
      }

      // ── Step 5: Session ──
      // The Supabase client's _initialize() auto-handles ?code PKCE exchange
      // when detectSessionInUrl is true (default for browsers). It reads the
      // PKCE verifier from cookies, exchanges the code, saves the session, and
      // fires SIGNED_IN. We must NOT call exchangeCodeForSession() manually.
      log({ step: "5-session", status: "info", message: "Checking if session already exists (auto-exchanged by Supabase client)..." });

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        log({ step: "5-session", status: "error", message: `getSession error: ${sessionError.message}` });
      }

      if (sessionData?.session) {
        log({ step: "5-session", status: "ok", message: `Session exists! user_id=${sessionData.session.user.id}` });

        const { data: userData } = await supabase.auth.getUser();
        log({ step: "5b-user", status: userData?.user ? "ok" : "error", message: `getUser: ${userData?.user?.id} ${userData?.user?.email}` });

        if (userData?.user && !cancelled) {
          await finalize(userData.user.id);
        }
        return;
      }

      // No session yet — the client may still be initializing.
      // Listen for the SIGNED_IN event which fires after auto-exchange.
      log({ step: "5-session", status: "info", message: "No session yet, listening for SIGNED_IN event..." });

      // Try manual exchange as a fallback in case the auto-exchange
      // consumed the verifier cookie but our onAuthStateChange hasn't fired.
      let manualAttempted = false;
      if (code) {
        try {
          log({ step: "5-manual", status: "info", message: "Attempting manual PKCE exchange..." });
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && exchangeData?.session) {
            manualAttempted = true;
            log({ step: "5-manual", status: "ok", message: `Manual exchange succeeded! user_id=${exchangeData.session.user.id}` });
            if (!cancelled) {
              await finalize(exchangeData.session.user.id);
            }
            return;
          }
          if (exchangeError) {
            log({ step: "5-manual", status: "error", message: `Manual exchange failed: ${exchangeError.message}` });
          }
        } catch (e) {
          log({ step: "5-manual", status: "error", message: `Manual exchange exception: ${e instanceof Error ? e.message : String(e)}` });
        }
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (cancelled) return;

          log({ step: "5b-event", status: "ok", message: `Auth event: ${event}, user=${newSession?.user?.id}` });

          if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && newSession?.user) {
            subscription.unsubscribe();
            await finalize(newSession.user.id);
          }
        }
      );

      // Safety timeout — if no event fires in 10s, show error
      setTimeout(() => {
        if (!cancelled && !manualAttempted) {
          log({ step: "5-timeout", status: "error", message: "Timed out waiting for session. No SIGNED_IN event received." });
          setFatalError("Authentication timed out. The magic link may have expired or the session could not be established.");
          subscription.unsubscribe();
        }
      }, 10000);
    };

    handleAuth();

    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase, log, finalize]);

  if (fatalError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg space-y-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="text-sm font-medium text-destructive">{fatalError}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Debug Log</p>
            <div className="max-h-96 space-y-1 overflow-y-auto font-mono text-xs">
              {logs.map((entry, i) => (
                <div key={i} className={
                  entry.status === "error"
                    ? "text-destructive"
                    : entry.status === "ok"
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                }>
                  <span className="opacity-50">{entry.timestamp}</span>{" "}
                  <span className="font-semibold">[{entry.step}]</span>{" "}
                  {entry.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying your account...</p>
      </div>
    </div>
  );
}
