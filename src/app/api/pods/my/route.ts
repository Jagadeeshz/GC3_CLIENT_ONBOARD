import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET() {
  const auth = await authorize("pod", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data: memberships, error: memberError } = await supabase
    .from("pod_members")
    .select("pod_id")
    .eq("user_id", auth.user.id);

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const podIds = (memberships || []).map((m) => m.pod_id);
  if (podIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const { data: pods, error } = await supabase
    .from("pods")
    .select(
      `
      *,
      manager:manager_id(id, full_name, email, avatar_url),
      members:pod_members(
        id,
        member:profiles(id, full_name, role, avatar_url)
      )
    `
    )
    .in("id", podIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: pods || [] });
}
