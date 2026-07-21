import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("feedback", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("feedback")
    .select(
      `
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email, avatar_url)),
      deliverable:deliverable_id(id, title),
      request:request_id(id, title)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("feedback", "update");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { rating, comment, type, is_anonymous } = body;

  const supabase = await createSupabaseServerClient();

  const updateData: Record<string, unknown> = {};
  if (rating !== undefined) updateData.rating = rating;
  if (comment !== undefined) updateData.comment = comment;
  if (type !== undefined) updateData.type = type;
  if (is_anonymous !== undefined) updateData.is_anonymous = is_anonymous;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feedback")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
