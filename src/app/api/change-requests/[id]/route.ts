import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";
import type { ChangeRequestStatus } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("change_request", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("change_requests")
    .select(
      `
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email, avatar_url)),
      request:request_id(id, title, status),
      pod:pod_id(id, name),
      reviewer:reviewed_by(id, full_name, avatar_url)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Change request not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("change_request", "update");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { status, pod_manager_notes } = body as {
    status?: ChangeRequestStatus;
    pod_manager_notes?: string;
  };

  const supabase = await createSupabaseServerClient();

  const updateData: Record<string, unknown> = {};
  if (status) {
    updateData.status = status;
    if (status === "approved" || status === "rejected") {
      updateData.reviewed_by = auth.user.id;
      updateData.reviewed_at = new Date().toISOString();
    }
  }
  if (pod_manager_notes !== undefined) {
    updateData.pod_manager_notes = pod_manager_notes;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("change_requests")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
