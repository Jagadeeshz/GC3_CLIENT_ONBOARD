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

  const pathname = request.nextUrl.pathname;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!user && !isPublicRoute) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "account_deactivated");
      return NextResponse.redirect(url);
    }

    const role = profile?.role || "";

    for (const route of routeRoleMap) {
      if (pathname.startsWith(route.prefix)) {
        if (!route.allowedRoles.includes(role)) {
          const url = request.nextUrl.clone();
          url.pathname = role === "client" ? "/client/dashboard" : "/unauthorized";
          return NextResponse.redirect(url);
        }
        break;
      }
    }

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
