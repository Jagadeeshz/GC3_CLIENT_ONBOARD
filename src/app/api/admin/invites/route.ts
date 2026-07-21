import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { authorize } from "@/lib/rbac/authorize";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["client", "pod_member", "pod_manager", "cpiu", "leadership"]),
  company_name: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const auth = await authorize("profile", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: profiles });
}

export async function POST(request: Request) {
  const auth = await authorize("profile", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, full_name, role, company_name, notes } = parsed.data;

  const supabase = await createSupabaseServerClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existingProfile) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name,
        role,
        invited_by: auth.user.id,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/accept-invite`,
    }
  );

  if (inviteError) {
    return NextResponse.json(
      { error: inviteError.message },
      { status: 500 }
    );
  }

  if (role === "client" && company_name) {
    const { error: clientError } = await supabase.from("clients").insert({
      profile_id: inviteData.user.id,
      company_name,
      notes: notes || null,
    });

    if (clientError) {
      console.error("Failed to create client record:", clientError);
    }
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
