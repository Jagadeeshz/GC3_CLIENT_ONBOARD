import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("feedback", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const comment = data.comment || "";
  const lines = comment.split("\n\n");
  const subject = lines[0] || "Support Ticket";
  const description = lines.slice(1).join("\n\n") || comment;

  return NextResponse.json({
    data: {
      id: data.id,
      subject,
      description,
      status: data.rating && data.rating >= 4 ? "resolved" : "open",
      category: data.type || "general",
      priority: "medium",
      created_at: data.created_at,
      updated_at: data.updated_at,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("feedback", "update");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const validStatuses = ["open", "in_progress", "resolved", "closed"];
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (body.status === "resolved") updates.rating = 5;
  if (body.status === "open") updates.rating = 1;
  if (body.status === "in_progress") updates.rating = 3;
  if (body.status === "closed") updates.rating = 4;

  const { error } = await supabase
    .from("feedback")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Ticket updated" });
}
