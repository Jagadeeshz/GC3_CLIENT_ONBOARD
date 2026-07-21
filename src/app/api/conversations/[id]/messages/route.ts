import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("message", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("id")
    .eq("conversation_id", id)
    .eq("profile_id", auth.user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this conversation" }, { status: 403 });
  }

  const { data, error, count } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:sender_id(id, full_name, email, avatar_url)
    `,
      { count: "exact" }
    )
    .eq("conversation_id", id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .is("read_at", null)
    .neq("sender_id", auth.user.id);

  return NextResponse.json({
    data: (data || []).reverse(),
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("message", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { content, file_url, file_name, reply_to } = body as {
    content: string;
    file_url?: string;
    file_name?: string;
    reply_to?: string;
  };

  if (!content && !file_url) {
    return NextResponse.json({ error: "Content or file is required" }, { status: 400 });
  }

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
    .from("messages")
    .insert({
      conversation_id: id,
      sender_id: auth.user.id,
      content: content || "",
      file_url: file_url || null,
      file_name: file_name || null,
      reply_to: reply_to || null,
    })
    .select(
      `
      *,
      sender:sender_id(id, full_name, email, avatar_url)
    `
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ data }, { status: 201 });
}
