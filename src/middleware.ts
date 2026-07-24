import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/login/client",
  "/login/staff",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/accept-invite",
  "/session-expired",
  "/unauthorized",
  "/book-demo",
  "/pricing",
];

const routeRoleMap: { prefix: string; allowedRoles: string[] }[] = [
  { prefix: "/client/", allowedRoles: ["client"] },
  { prefix: "/operations/", allowedRoles: ["operations_team", "leadership"] },
  { prefix: "/pod/", allowedRoles: ["pod_member", "pod_manager", "leadership"] },
  { prefix: "/cpiu/", allowedRoles: ["cpiu", "leadership"] },
];

function getRoleDashboardPath(role: string): string {
  if (role === "client") return "/client/dashboard";
  return "/dashboard";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasCode = request.nextUrl.searchParams.has("code");
  const codeParam = request.nextUrl.searchParams.get("code");

  console.log(
    `[Middleware] ${pathname} code=${codeParam ? codeParam.slice(0, 8) + "..." : "none"}`
  );

  // Supabase verify may land user on / with the code param
  if (pathname === "/" && hasCode) {
    console.log(
      `[Middleware] Redirecting /?code=... → /auth/callback?code=...`
    );
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  // Let the callback route handler execute without interference
  if (pathname === "/auth/callback") {
    return NextResponse.next();
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[Middleware] User:", user);

  console.log(
    "[Middleware] Cookies:",
    request.cookies.getAll().map((c) => c.name)
  );

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Unauthenticated user on protected route
  if (!user && !isPublicRoute) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const isLoginPage =
      pathname === "/login" || pathname.startsWith("/login/");
    const isRegisterPage = pathname === "/register";

    // Already authenticated on login/register → redirect to dashboard
    if (isLoginPage || isRegisterPage) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role || "";
      const url = request.nextUrl.clone();
      url.pathname = getRoleDashboardPath(role);
      return NextResponse.redirect(url);
    }

    // Deactivated account check
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "account_deactivated");
      return NextResponse.redirect(url);
    }

    const role = profile?.role || "";

    // Staff on root → internal dashboard
    if (pathname === "/" && role !== "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Role-based route access
    for (const route of routeRoleMap) {
      if (pathname.startsWith(route.prefix)) {
        if (!route.allowedRoles.includes(role)) {
          const url = request.nextUrl.clone();
          url.pathname =
            role === "client" ? "/client/dashboard" : "/unauthorized";
          return NextResponse.redirect(url);
        }
        break;
      }
    }

    // Client isolation: client cannot access non-client routes
    if (
      role === "client" &&
      !pathname.startsWith("/client/") &&
      !pathname.startsWith("/api/") &&
      !isPublicRoute
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/client/dashboard";
      return NextResponse.redirect(url);
    }

    // Non-client cannot access client-only routes
    if (
      role !== "client" &&
      pathname.startsWith("/client/") &&
      !isPublicRoute
    ) {
      const url = request.nextUrl.clone();
      url.pathname = getRoleDashboardPath(role);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
