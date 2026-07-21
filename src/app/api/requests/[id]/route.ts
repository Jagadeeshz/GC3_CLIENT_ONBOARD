import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";
import { updateRequestSchema } from "@/validators/request";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("request", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("requests")
    .select(`
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email, avatar_url)),
      pod:pod_id(id, name),
      assignee:assigned_to(id, full_name, email, avatar_url),
      deliverables(id, title, status, version, file_url, created_at)
    `)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("request", "update");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const validated = updateRequestSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("requests")
    .update(validated.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("request", "delete");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("requests")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Request deleted" });
}
