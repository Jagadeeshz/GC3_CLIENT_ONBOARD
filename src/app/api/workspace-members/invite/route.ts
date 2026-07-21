import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/rbac/authorize";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["project_manager", "marketing", "finance", "reviewer", "viewer"]),
  department: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await authorize("workspace_member", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, full_name, role, department, phone } = parsed.data;

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

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existingProfile) {
    const { data: existingMember } = await supabase
      .from("workspace_members")
      .select("id, status")
      .eq("profile_id", existingProfile.id)
      .eq("client_id", client.id)
      .single();

    if (existingMember) {
      if (existingMember.status === "suspended") {
        await supabase
          .from("workspace_members")
          .update({ status: "active", role })
          .eq("id", existingMember.id);

        return NextResponse.json({
          message: `Member ${full_name} has been reactivated`,
        });
      }
      return NextResponse.json(
        { error: "This user is already a workspace member" },
        { status: 409 }
      );
    }
  }

  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name,
        role: "client",
        workspace_role: role,
        client_id: client.id,
        invited_by: auth.user.id,
        department: department || null,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?next=/client/dashboard`,
    }
  );

  if (inviteError) {
    return NextResponse.json(
      { error: inviteError.message },
      { status: 500 }
    );
  }

  const { error: memberError } = await supabase.from("workspace_members").insert({
    profile_id: inviteData.user.id,
    client_id: client.id,
    role,
    department: department || null,
    phone: phone || null,
    invited_by: auth.user.id,
    status: "pending",
  });

  if (memberError) {
    console.error("Failed to create workspace member record:", memberError);
  }

  return NextResponse.json({
    data: {
      id: inviteData.user.id,
      email: inviteData.user.email,
      role,
      invited_at: new Date().toISOString(),
    },
    message: `Invitation sent to ${email}`,
  });
}
