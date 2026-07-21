import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";
import { createRequestSchema } from "@/validators/request";

export async function GET(request: NextRequest) {
  const auth = await authorize("request", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");
  const assignedTo = searchParams.get("assigned_to");
  const podId = searchParams.get("pod_id");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("requests")
    .select(
      `
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email)),
      pod:pod_id(id, name),
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
      query = query.eq("client_id", client.id);
    }
  }

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (assignedTo) query = query.eq("assigned_to", assignedTo);
  if (podId) query = query.eq("pod_id", podId);
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
  const auth = await authorize("request", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const validated = createRequestSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten().fieldErrors },
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
    .from("requests")
    .insert({
      ...validated.data,
      client_id: client.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
