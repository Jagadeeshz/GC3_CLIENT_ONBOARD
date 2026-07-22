"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Authenticating and loading Client Dashboard...");

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const processAuth = async () => {
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/client/dashboard";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          router.replace(next);
          return;
        }

        // Fallback: Check if session exists (auto-exchanged by Supabase listener)
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          router.replace(next);
          return;
        }

        setStatus(`Authentication Error: ${error.message}`);
      } else {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          router.replace(next);
        } else {
          setStatus("No auth code found in link.");
        }
      }
    };

    processAuth();
  }, [router, searchParams]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#09090b",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "#18181b",
          borderRadius: "8px",
          border: "1px solid #27272a",
        }}
      >
        <h2>Entering Client Portal...</h2>
        <p style={{ color: "#a1a1aa", marginTop: "0.5rem" }}>{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
