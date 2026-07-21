import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("deliverable", "read");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("deliverables")
    .select(
      `
      *,
      request:request_id(id, title, status, client_id),
      assignee:assigned_to(id, full_name, email, avatar_url),
      versions:deliverable_versions(*)
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
  const auth = await authorize("deliverable", "update");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const updates: Record<string, unknown> = {};
  const allowed = ["title", "description", "status", "assigned_to", "file_url", "file_name", "file_size"];
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (body.status === "submitted") {
    updates.submitted_at = new Date().toISOString();
    const { data: current } = await supabase
      .from("deliverables")
      .select("version")
      .eq("id", id)
      .single();
    updates.version = (current?.version || 0) + 1;

    await supabase.from("deliverable_versions").insert({
      deliverable_id: id,
      version: updates.version,
      file_url: body.file_url || null,
      file_name: body.file_name || null,
      file_size: body.file_size || null,
    });
  }

  if (body.status === "approved") {
    updates.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("deliverables")
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
  const auth = await authorize("deliverable", "delete");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("deliverables")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
