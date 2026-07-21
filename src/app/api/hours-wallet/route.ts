import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(_request: NextRequest) {
  const auth = await authorize("hours_wallet", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  if (auth.user.role === "client") {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", auth.user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("hours_wallet")
      .select("*")
      .eq("client_id", client.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  const clientId = _request.nextUrl.searchParams.get("client_id");
  if (!clientId) {
    return NextResponse.json({ error: "client_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("hours_wallet")
    .select("*")
    .eq("client_id", clientId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
