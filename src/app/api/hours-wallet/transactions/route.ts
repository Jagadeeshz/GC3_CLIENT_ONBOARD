import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("hours_transaction", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);

  const walletId = searchParams.get("wallet_id");
  if (!walletId) {
    return NextResponse.json({ error: "wallet_id is required" }, { status: 400 });
  }

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("hours_transactions")
    .select(
      `
      *,
      request:request_id(id, title),
      creator:created_by(id, full_name)
    `,
      { count: "exact" }
    )
    .eq("wallet_id", walletId)
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
  const auth = await authorize("hours_transaction", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();

  if (!body.wallet_id || !body.hours || !body.type) {
    return NextResponse.json(
      { error: "wallet_id, hours, and type are required" },
      { status: 400 }
    );
  }

  if (!["credit", "debit"].includes(body.type)) {
    return NextResponse.json(
      { error: "type must be 'credit' or 'debit'" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: transaction, error: txnError } = await supabase
    .from("hours_transactions")
    .insert({
      wallet_id: body.wallet_id,
      request_id: body.request_id || null,
      hours: body.hours,
      type: body.type,
      description: body.description || null,
      created_by: auth.user.id,
    })
    .select()
    .single();

  if (txnError) {
    return NextResponse.json({ error: txnError.message }, { status: 500 });
  }

  const hoursField = body.type === "credit" ? "total_hours" : "used_hours";
  const { error: updateError } = await supabase.rpc("update_wallet_hours", {
    p_wallet_id: body.wallet_id,
    p_field: hoursField,
    p_amount: body.hours,
  });

  if (updateError) {
    const { data: wallet } = await supabase
      .from("hours_wallet")
      .select("*")
      .eq("id", body.wallet_id)
      .single();

    if (wallet) {
      const newVal =
        body.type === "credit"
          ? Number(wallet.total_hours) + body.hours
          : Number(wallet.used_hours) + body.hours;

      const updateField = body.type === "credit" ? "total_hours" : "used_hours";
      await supabase
        .from("hours_wallet")
        .update({ [updateField]: newVal })
        .eq("id", body.wallet_id);
    }
  }

  return NextResponse.json({ data: transaction }, { status: 201 });
}
