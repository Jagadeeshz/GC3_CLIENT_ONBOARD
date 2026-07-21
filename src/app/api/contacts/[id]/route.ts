import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";
import { updateContactSchema } from "@/validators/contact";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("contact", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("contacts")
    .select(
      `
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email, avatar_url))
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("contact", "update");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const validated = updateContactSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("contacts")
    .update(validated.data)
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
  const auth = await authorize("contact", "manage");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Contact deleted" });
}
