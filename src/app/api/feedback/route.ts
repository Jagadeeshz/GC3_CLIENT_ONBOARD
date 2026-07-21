import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("feedback", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const type = searchParams.get("type");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("feedback")
    .select(
      `
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email, avatar_url)),
      deliverable:deliverable_id(id, title),
      request:request_id(id, title)
    `,
      { count: "exact" }
    );

  if (auth.user.role === "client") {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", auth.user.id)
      .single();
    if (client) {
      query = query.eq("client_id", client.id);
    }
  }

  if (type && type !== "all") {
    query = query.eq("type", type);
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
  const auth = await authorize("feedback", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { deliverable_id, request_id, type, rating, comment, is_anonymous } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", auth.user.id)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      client_id: client.id,
      deliverable_id: deliverable_id || null,
      request_id: request_id || null,
      type: type || "general",
      rating,
      comment: comment || null,
      is_anonymous: is_anonymous || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
