import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("document", "read");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      uploader:uploaded_by(id, full_name, email),
      client:client_id(id, company_name)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("document", "update");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const updates: Record<string, unknown> = {};
  const allowed = ["title", "description", "category", "folder", "client_id", "request_id", "is_archived"];
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("document", "delete");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
