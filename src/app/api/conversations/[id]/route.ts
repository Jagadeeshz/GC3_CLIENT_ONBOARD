import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("conversation", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", id)
    .eq("profile_id", auth.user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this conversation" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      members:conversation_members(
        profile:profile_id(id, full_name, email, avatar_url)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
