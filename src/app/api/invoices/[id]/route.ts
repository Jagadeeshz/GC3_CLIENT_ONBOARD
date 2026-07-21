import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";
import { updateInvoiceSchema } from "@/validators/invoice";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("invoice", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email, avatar_url)),
      line_items:invoice_line_items(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("invoice", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const validated = updateInvoiceSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { line_items, ...invoiceUpdates } = validated.data;

  const { data, error } = await supabase
    .from("invoices")
    .update(invoiceUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (line_items) {
    await supabase.from("invoice_line_items").delete().eq("invoice_id", id);
    if (line_items.length > 0) {
      await supabase
        .from("invoice_line_items")
        .insert(line_items.map((item) => ({ ...item, invoice_id: id })));
    }
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("invoice", "manage");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  await supabase.from("invoice_line_items").delete().eq("invoice_id", id);

  const { error } = await supabase.from("invoices").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Invoice deleted" });
}
