import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("change_request", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("change_requests")
    .select(
      `
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email)),
      request:request_id(id, title),
      pod:pod_id(id, name),
      reviewer:reviewed_by(id, full_name)
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

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
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
  const auth = await authorize("change_request", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { title, description, request_id, pod_id, estimated_hours, estimated_cost, reason } = body;

  if (!title || !description || !request_id) {
    return NextResponse.json(
      { error: "Title, description, and request_id are required" },
      { status: 400 }
    );
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
    .from("change_requests")
    .insert({
      title,
      description,
      request_id,
      client_id: client.id,
      pod_id: pod_id || null,
      estimated_hours: estimated_hours || null,
      estimated_cost: estimated_cost || null,
      reason: reason || null,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
