import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("setting", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Setting not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("setting", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { key, value, description, category } = body;

  const updates: Record<string, unknown> = {};
  if (key !== undefined) updates.key = key;
  if (value !== undefined) updates.value = value;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("settings")
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("setting", "manage");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("settings").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Setting deleted" });
}
