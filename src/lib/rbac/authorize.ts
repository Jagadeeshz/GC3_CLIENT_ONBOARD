import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { hasPermission } from "./guards";
import type { Resource, Action } from "./permissions";
import type { UserProfile } from "@/types";

export async function authorize(
  resource: Resource,
  action: Action
): Promise<
  | { authorized: true; user: UserProfile }
  | { authorized: false; response: NextResponse }
> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      ),
    };
  }

  if (!profile.is_active) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      ),
    };
  }

  if (!hasPermission(profile.role, resource, action)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user: profile as UserProfile };
}

export async function authorizeRole(
  ...roles: string[]
): Promise<
  | { authorized: true; user: UserProfile }
  | { authorized: false; response: NextResponse }
> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      ),
    };
  }

  if (!profile.is_active) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      ),
    };
  }

  if (!roles.includes(profile.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user: profile as UserProfile };
}
