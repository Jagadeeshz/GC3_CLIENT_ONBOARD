import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";
import { createContactSchema } from "@/validators/contact";

export async function GET(request: NextRequest) {
  const auth = await authorize("contact", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");
  const client_id = searchParams.get("client_id");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("contacts")
    .select(
      `
      *,
      client:client_id(id, company_name)
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

  if (client_id) query = query.eq("client_id", client_id);
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("is_primary", { ascending: false })
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
  const auth = await authorize("contact", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const validated = createContactSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("contacts")
    .insert(validated.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
