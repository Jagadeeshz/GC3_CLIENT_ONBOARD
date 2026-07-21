import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("document", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category");
  const folder = searchParams.get("folder");
  const clientId = searchParams.get("client_id");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("documents")
    .select(
      `
      *,
      uploader:uploaded_by(id, full_name, email),
      client:client_id(id, company_name)
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

  if (category) query = query.eq("category", category);
  if (folder) query = query.eq("folder", folder);
  if (clientId) query = query.eq("client_id", clientId);

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
  const auth = await authorize("document", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();

  if (!body.title || !body.file_url || !body.file_name) {
    return NextResponse.json(
      { error: "title, file_url, and file_name are required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      title: body.title,
      description: body.description || null,
      category: body.category || "other",
      file_url: body.file_url,
      file_name: body.file_name,
      file_size: body.file_size || null,
      mime_type: body.mime_type || null,
      client_id: body.client_id || null,
      request_id: body.request_id || null,
      uploaded_by: auth.user.id,
      folder: body.folder || "/",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
