import React from "react";
import { redirect } from "next/navigation";
import { ChangeRequestDetail } from "@/components/change-requests/change-request-detail";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getUserRole(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role ?? "viewer";
}

async function ChangeRequestDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userRole = await getUserRole();
  return <ChangeRequestDetail changeRequestId={id} userRole={userRole} />;
}

export default function ChangeRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ChangeRequestDetailPageContent params={params} />;
}
