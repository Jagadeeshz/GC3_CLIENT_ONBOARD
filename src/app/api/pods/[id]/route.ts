import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("pod", "read");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: pod, error } = await supabase
    .from("pods")
    .select(
      `
      *,
      manager:manager_id(id, full_name, email, avatar_url),
      members:pod_members(
        id,
        role,
        joined_at,
        member:profiles(id, full_name, email, avatar_url, role)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !pod) {
    return NextResponse.json({ error: "Pod not found" }, { status: 404 });
  }

  const { data: requests } = await supabase
    .from("requests")
    .select("id, title, status, priority, client_id, created_at")
    .eq("pod_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    data: {
      ...pod,
      requests: requests || [],
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("pod", "update");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const updates: Record<string, unknown> = {};
  if ("name" in body) updates.name = body.name;
  if ("description" in body) updates.description = body.description;
  if ("manager_id" in body) updates.manager_id = body.manager_id;
  if ("is_active" in body) updates.is_active = body.is_active;
  updates.updated_at = new Date().toISOString();

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pods")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
