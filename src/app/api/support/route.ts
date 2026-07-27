import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(_request: NextRequest) {
  const auth = await authorize("notification", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("client_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const tickets = (data || []).map((item) => ({
    id: item.id,
    subject: item.comment?.split("\n")[0] || "Support Ticket",
    description: item.comment || "",
    status: item.rating && item.rating >= 4 ? "resolved" : "open",
    category: item.type || "general",
    priority: "medium",
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));

  return NextResponse.json({ data: tickets, total: tickets.length });
}

export async function POST(request: NextRequest) {
  const auth = await authorize("feedback", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { subject, description, category, priority } = body;

  if (!subject || !description) {
    return NextResponse.json(
      { error: "Subject and description are required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      client_id: auth.user.id,
      type: "general",
      comment: `${subject}\n\n${description}`,
      is_anonymous: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      id: data.id,
      subject,
      description,
      status: "open",
      category: category || "general",
      priority: priority || "medium",
      created_at: data.created_at,
      updated_at: data.updated_at,
    },
  }, { status: 201 });
}
