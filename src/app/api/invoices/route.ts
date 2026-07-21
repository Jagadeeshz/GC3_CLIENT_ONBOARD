import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";
import { createInvoiceSchema } from "@/validators/invoice";

export async function GET(request: NextRequest) {
  const auth = await authorize("invoice", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("invoices")
    .select(
      `
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email)),
      line_items:invoice_line_items(*)
    `,
      { count: "exact" }
    );

  if (auth.user.role === "client") {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", auth.user.id)
      .single();
    if (client) {
      query = query.eq("client_id", client.id);
    }
  }

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(`invoice_number.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const auth = await authorize("invoice", "manage");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const validated = createInvoiceSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { line_items, ...invoiceData } = validated.data;

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      ...invoiceData,
      created_by: auth.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (line_items && line_items.length > 0) {
    const { error: lineItemError } = await supabase
      .from("invoice_line_items")
      .insert(line_items.map((item) => ({ ...item, invoice_id: invoice.id })));

    if (lineItemError) {
      return NextResponse.json({ error: lineItemError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ data: invoice }, { status: 201 });
}
