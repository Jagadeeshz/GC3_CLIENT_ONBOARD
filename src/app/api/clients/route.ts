import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("client", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("clients")
    .select(
      `
      *,
      profile:profile_id(full_name, email, avatar_url, is_active),
      contacts:contacts(id, full_name, email, is_primary),
      hours_wallet:hours_wallets(total_hours, used_hours, remaining_hours)
    `,
      { count: "exact" }
    );

  if (search) {
    query = query.or(`company_name.ilike.%${search}%,industry.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const auth = await authorize("client", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { company_name, industry, website, address, city, state, country, postal_code, tax_id, notes } = body;

  if (!company_name) {
    return NextResponse.json({ error: "company_name is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      company_name,
      industry: industry || null,
      website: website || null,
      address: address || null,
      city: city || null,
      state: state || null,
      country: country || null,
      postal_code: postal_code || null,
      tax_id: tax_id || null,
      notes: notes || null,
      profile_id: auth.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
