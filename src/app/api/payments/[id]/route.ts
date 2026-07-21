import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";
import { updatePaymentSchema } from "@/validators/payment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("payment", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      invoice:invoice_id(id, invoice_number, amount, due_date),
      client:client_id(id, company_name, profiles:profile_id(full_name, email, avatar_url))
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("payment", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const validated = updatePaymentSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("payments")
    .update(validated.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
