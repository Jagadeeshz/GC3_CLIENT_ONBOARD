import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("client", "read");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clients")
    .select(
      `
      *,
      profile:profile_id(id, full_name, email, avatar_url),
      contacts:contacts(id, full_name, email, phone, title, department, is_primary),
      hours_wallet:hours_wallets(id, total_hours, used_hours, remaining_hours, billing_period_start, billing_period_end)
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: requests } = await supabase
    .from("requests")
    .select("id, status, title, pod_id, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const { data: podMembers } = await supabase
    .from("pod_members")
    .select(`
      pod:pods(id, name),
      member:profiles(id, full_name, role)
    `)
    .in("pod_id", [...new Set((requests || []).map((r) => r.pod_id).filter(Boolean))]);

  return NextResponse.json({
    data: {
      ...data,
      requests: requests || [],
      assignedPods: podMembers || [],
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("client", "manage");
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const allowedFields = [
    "company_name",
    "industry",
    "website",
    "address",
    "city",
    "state",
    "country",
    "postal_code",
    "tax_id",
    "notes",
    "is_active",
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }
  updates.updated_at = new Date().toISOString();

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
