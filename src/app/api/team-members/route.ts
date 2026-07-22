import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET() {
  const auth = await authorize("workspace_member", "read_own");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", auth.user.id)
    .single();

  if (!client) {
    const { data: members } = await supabase
      .from("workspace_members")
      .select(`
        *,
        profile:profiles(id, email, full_name, avatar_url, role, is_active, last_login_at),
        inviter:profiles!workspace_members_invited_by_fkey(id, full_name, email)
      `)
      .eq("profile_id", auth.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    return NextResponse.json({ data: members || [] });
  }

  const { data: members, error } = await supabase
    .from("workspace_members")
    .select(`
      *,
      profile:profiles(id, email, full_name, avatar_url, role, is_active, last_login_at),
      inviter:profiles!workspace_members_invited_by_fkey(id, full_name, email)
    `)
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: members });
}
