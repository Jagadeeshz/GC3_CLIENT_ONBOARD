import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/client/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log(
    `[Auth Callback] code=${code ? code.slice(0, 8) + "..." : "none"} next=${next} error=${error || "none"}`
  );

  if (error) {
    console.warn(
      `[Auth Callback] Supabase error: ${error} - ${errorDescription}`
    );
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", error);
    if (errorDescription) {
      loginUrl.searchParams.set("error_description", errorDescription);
    }
    let supabaseResponse = NextResponse.next({ request });
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  if (!code) {
    console.warn("[Auth Callback] No code in URL, redirecting to login");
    let supabaseResponse = NextResponse.next({ request });
    const redirectResponse = NextResponse.redirect(new URL("/login", origin));
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[Auth Callback] Exchange error:", exchangeError.message);
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "session_expired");
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  console.log(
    `[Auth Callback] Session established, redirecting to ${next}`
  );

  const url = request.nextUrl.clone();
  url.pathname = next;

  const redirectResponse = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}
