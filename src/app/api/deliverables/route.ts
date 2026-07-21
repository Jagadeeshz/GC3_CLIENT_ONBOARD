import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("deliverable", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const requestId = searchParams.get("request_id");
  const assignedTo = searchParams.get("assigned_to");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("deliverables")
    .select(
      `
      *,
      request:request_id(id, title, status),
      assignee:assigned_to(id, full_name, email, avatar_url)
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
      const { data: requests } = await supabase
        .from("requests")
        .select("id")
        .eq("client_id", client.id);
      const requestIds = (requests || []).map((r) => r.id);
      query = query.in("request_id", requestIds);
    }
  }

  if (status) query = query.eq("status", status);
  if (requestId) query = query.eq("request_id", requestId);
  if (assignedTo) query = query.eq("assigned_to", assignedTo);

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
  const auth = await authorize("deliverable", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();

  if (!body.title || !body.request_id) {
    return NextResponse.json(
      { error: "Title and request_id are required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("deliverables")
    .insert({
      title: body.title,
      description: body.description || null,
      request_id: body.request_id,
      pod_id: body.pod_id || null,
      assigned_to: body.assigned_to || null,
      status: "pending",
      version: 1,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
