import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("conversation", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const { data: memberships, error: memberError } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("profile_id", auth.user.id);

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const conversationIds = (memberships || []).map((m) => m.conversation_id);

  if (conversationIds.length === 0) {
    return NextResponse.json({ data: [], total: 0, page, limit, totalPages: 0 });
  }

  const { data, error, count } = await supabase
    .from("conversations")
    .select(
      `
      *,
      members:conversation_members(
        profile:profile_id(id, full_name, email, avatar_url)
      ),
      last_message:messages(
        id, content, sender_id, created_at, file_url, file_name
      )
    `,
      { count: "exact" }
    )
    .in("id", conversationIds)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const conversations = (data || []).map((conv) => {
    const msgs = (conv as Record<string, unknown>).last_message as Array<Record<string, unknown>> | null;
    const lastMsg = msgs && msgs.length > 0 ? msgs[0] : null;
    const members = (conv as Record<string, unknown>).members as Array<Record<string, unknown>> | undefined;
    return {
      ...conv,
      last_message: lastMsg || null,
      members: members || [],
      unread_count: 0,
    };
  });

  return NextResponse.json({
    data: conversations,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const auth = await authorize("conversation", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { title, member_ids, is_group } = body as {
    title?: string;
    member_ids: string[];
    is_group?: boolean;
  };

  if (!member_ids || member_ids.length === 0) {
    return NextResponse.json({ error: "At least one member is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({
      title: title || null,
      is_group: is_group || member_ids.length > 2,
    })
    .select()
    .single();

  if (convError) {
    return NextResponse.json({ error: convError.message }, { status: 500 });
  }

  const allMemberIds = Array.from(new Set([auth.user.id, ...member_ids]));
  const { error: memberError } = await supabase
    .from("conversation_members")
    .insert(
      allMemberIds.map((pid) => ({
        conversation_id: conversation.id,
        profile_id: pid,
      }))
    );

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ data: conversation }, { status: 201 });
}
