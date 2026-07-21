import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/login/client", "/login/staff", "/register", "/forgot-password", "/reset-password", "/auth/callback", "/auth/accept-invite", "/session-expired", "/unauthorized", "/book-demo", "/pricing"];

const adminOnlyRoutes = ["/admin", "/pods", "/payments"];
const managerRoutes = ["/change-requests"];
const staffOnlyRoutes = ["/reports", "/contacts", "/hours-wallet"];
const clientOnlyRoutes = ["/feedback", "/invoices"];

function isAdminRole(role: string): boolean {
  return role === "cpiu" || role === "leadership";
}

function isManagerOrAbove(role: string): boolean {
  return role === "cpiu" || role === "leadership" || role === "pod_manager";
}

function isStaffRole(role: string): boolean {
  return role === "pod_member" || role === "pod_manager" || role === "cpiu" || role === "leadership" || role === "operations_team";
}

function isClientRole(role: string): boolean {
  return role === "client";
}

function getRoleDashboardPath(role: string): string {
  if (isClientRole(role)) {
    return "/client/dashboard";
  }
  return "/dashboard";
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
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

  const pathname = request.nextUrl.pathname;

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const isLoginPage = pathname === "/login" || pathname.startsWith("/login/");
    const isRegisterPage = pathname === "/register";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "account_deactivated");
      return NextResponse.redirect(url);
    }

    const role = profile?.role || "";

    if (isClientRole(role) && !pathname.startsWith("/client/") && isStaffProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    if (isStaffRole(role) && pathname.startsWith("/client/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    const isAdminRoute = adminOnlyRoutes.some((route) => pathname.startsWith(route));
    if (isAdminRoute && !isAdminRole(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    const isManagerRoute = managerRoutes.some((route) => pathname.startsWith(route));
    if (isManagerRoute && !isManagerOrAbove(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    const isStaffRoute = staffOnlyRoutes.some((route) => pathname.startsWith(route));
    if (isStaffRoute && !isStaffRole(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    const isClientRoute = clientOnlyRoutes.some((route) => pathname.startsWith(route));
    if (isClientRoute && role === "pod_member") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

function isStaffProtectedRoute(pathname: string): boolean {
  if (pathname.startsWith("/client/")) return false;
  if (pathname.startsWith("/api/")) return false;
  const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/auth", "/session-expired", "/unauthorized"];
  return !publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
