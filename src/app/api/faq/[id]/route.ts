import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("faq", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("faq", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { question, answer, category, sort_order, is_published } = body;

  const updates: Record<string, unknown> = {};
  if (question !== undefined) updates.question = question;
  if (answer !== undefined) updates.answer = answer;
  if (category !== undefined) updates.category = category;
  if (sort_order !== undefined) updates.sort_order = sort_order;
  if (is_published !== undefined) updates.is_published = is_published;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("faqs")
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
  const auth = await authorize("faq", "manage");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "FAQ deleted" });
}
