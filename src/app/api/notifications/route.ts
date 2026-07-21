import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("notification", "read");
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const unreadOnly = searchParams.get("unread") === "true";
  const offset = (page - 1) * limit;

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user.id);

  if (unreadOnly) {
    query = query.eq("read", false);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const auth = await authorize("notification", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { user_id, title, message, type, link, metadata } = body;

  if (!user_id || !title || !message) {
    return NextResponse.json(
      { error: "user_id, title, and message are required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id,
      title,
      message,
      type: type || "info",
      link: link || null,
      metadata: metadata || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
