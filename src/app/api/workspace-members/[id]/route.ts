import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/rbac/authorize";
import { z } from "zod";

const updateMemberSchema = z.object({
  role: z.enum(["project_manager", "marketing", "finance", "reviewer", "viewer"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  department: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("workspace_member", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const parsed = updateMemberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", auth.user.id)
    .single();

  if (!client) {
    return NextResponse.json(
      { error: "Client workspace not found" },
      { status: 404 }
    );
  }

  const { data: member } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("id", id)
    .eq("client_id", client.id)
    .single();

  if (!member) {
    return NextResponse.json(
      { error: "Workspace member not found" },
      { status: 404 }
    );
  }

  if (member.role === "owner" && parsed.data.status === "suspended") {
    return NextResponse.json(
      { error: "Cannot suspend the workspace owner" },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.department !== undefined) updateData.department = parsed.data.department;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;

  const { error } = await supabase
    .from("workspace_members")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Member updated successfully" });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("workspace_member", "manage");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", auth.user.id)
    .single();

  if (!client) {
    return NextResponse.json(
      { error: "Client workspace not found" },
      { status: 404 }
    );
  }

  const { data: member } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("id", id)
    .eq("client_id", client.id)
    .single();

  if (!member) {
    return NextResponse.json(
      { error: "Workspace member not found" },
      { status: 404 }
    );
  }

  if (member.role === "owner") {
    return NextResponse.json(
      { error: "Cannot remove the workspace owner" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Member removed successfully" });
}
