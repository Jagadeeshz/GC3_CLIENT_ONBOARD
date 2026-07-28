import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

async function getClientPodId(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) {
  const { data: memberships } = await supabase
    .from("pod_members")
    .select("pod_id")
    .eq("profile_id", userId);

  if (!memberships || memberships.length === 0) return null;
  return memberships[0].pod_id;
}

export async function GET() {
  const auth = await authorize("pod", "read_own");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const podId = await getClientPodId(supabase, auth.user.id);

  if (!podId) {
    return NextResponse.json({ data: [], pod: null });
  }

  const { data: pod } = await supabase
    .from("pods")
    .select(`
      id, name, description, is_active,
      manager:manager_id(id, full_name, email, avatar_url, role)
    `)
    .eq("id", podId)
    .single();

  const { data: members, error } = await supabase
    .from("pod_members")
    .select(`
      id,
      role,
      joined_at,
      member:profiles(id, full_name, email, avatar_url, role, phone, is_active)
    `)
    .eq("pod_id", podId)
    .order("joined_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: engagements } = await supabase
    .from("requests")
    .select("id, title, status, priority")
    .eq("pod_id", podId)
    .in("status", ["pending", "in_progress", "in_review"]);

  return NextResponse.json({
    data: members || [],
    pod,
    engagements: engagements || [],
  });
}

export async function POST(request: NextRequest) {
  const auth = await authorize("pod_member", "manage");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const podId = await getClientPodId(supabase, auth.user.id);

  if (!podId) {
    return NextResponse.json({ error: "You are not assigned to any pod" }, { status: 404 });
  }

  const body = await request.json();
  const { profile_id, role } = body;

  if (!profile_id) {
    return NextResponse.json({ error: "profile_id is required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("pod_members")
    .select("id")
    .eq("pod_id", podId)
    .eq("profile_id", profile_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "User is already a member of this pod" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("pod_members")
    .insert({
      pod_id: podId,
      profile_id,
      role: role || "poc",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await authorize("pod_member", "manage");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const podId = await getClientPodId(supabase, auth.user.id);

  if (!podId) {
    return NextResponse.json({ error: "You are not assigned to any pod" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profile_id");

  if (!profileId) {
    return NextResponse.json({ error: "profile_id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("pod_members")
    .delete()
    .eq("pod_id", podId)
    .eq("profile_id", profileId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
