import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const admin = searchParams.get("admin") === "true";

  if (admin) {
    const auth = await authorize("faq", "manage");
    if (!auth.authorized) return auth.response;

    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });

    if (search) {
      query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  const auth = await authorize("faq", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("faqs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (search) {
    query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const auth = await authorize("faq", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { question, answer, category, sort_order, is_published } = body;

  if (!question || !answer) {
    return NextResponse.json(
      { error: "Question and answer are required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("faqs")
    .insert({
      question,
      answer,
      category: category || "General",
      sort_order: sort_order ?? 0,
      is_published: is_published ?? true,
      created_by: auth.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
