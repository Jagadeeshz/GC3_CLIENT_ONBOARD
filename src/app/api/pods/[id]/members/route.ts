import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("pod_member", "read");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("pod_members")
    .select(
      `
      id,
      role,
      joined_at,
      member:profiles(id, full_name, email, avatar_url, role)
    `
    )
    .eq("pod_id", id)
    .order("joined_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("pod_member", "manage");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const { user_id, role } = body;

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("pod_members")
    .select("id")
    .eq("pod_id", id)
    .eq("user_id", user_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "User is already a member of this pod" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("pod_members")
    .insert({
      pod_id: id,
      user_id,
      role: role || "member",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("pod_member", "manage");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("pod_members")
    .delete()
    .eq("pod_id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
