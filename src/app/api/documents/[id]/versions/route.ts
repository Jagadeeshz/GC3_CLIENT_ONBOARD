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
    .from("document_versions")
    .select(
      `
      *,
      uploader:uploaded_by(id, full_name, email)
    `
    )
    .eq("document_id", id)
    .order("version", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("document", "update");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await request.json();

  if (!body.file_url || !body.file_name) {
    return NextResponse.json(
      { error: "file_url and file_name are required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("title")
    .eq("id", id)
    .single();

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { data: latestVersion } = await supabase
    .from("document_versions")
    .select("version")
    .eq("document_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (latestVersion?.version || 0) + 1;

  const { data, error } = await supabase
    .from("document_versions")
    .insert({
      document_id: id,
      version: nextVersion,
      file_url: body.file_url,
      file_name: body.file_name,
      file_size: body.file_size || null,
      mime_type: body.mime_type || null,
      notes: body.notes || null,
      uploaded_by: auth.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("documents")
    .update({
      file_url: body.file_url,
      file_name: body.file_name,
      file_size: body.file_size || null,
      mime_type: body.mime_type || null,
    })
    .eq("id", id);

  return NextResponse.json({ data }, { status: 201 });
}
