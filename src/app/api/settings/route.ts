import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("setting", "read");
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("settings")
    .select("*")
    .order("category", { ascending: true });

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
  const auth = await authorize("setting", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { key, value, description, category } = body;

  if (!key || value === undefined) {
    return NextResponse.json(
      { error: "Key and value are required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("settings")
    .select("id")
    .eq("key", key)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("settings")
      .update({ value, description, category })
      .eq("key", key)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  }

  const { data, error } = await supabase
    .from("settings")
    .insert({
      key,
      value,
      description: description || null,
      category: category || "general",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
