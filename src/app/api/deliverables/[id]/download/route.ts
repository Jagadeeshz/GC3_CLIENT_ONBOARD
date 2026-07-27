import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize("deliverable", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const { data: deliverable, error } = await supabase
    .from("deliverables")
    .select("id, title, file_url, file_name")
    .eq("id", id)
    .single();

  if (error || !deliverable) {
    return NextResponse.json({ error: "Deliverable not found" }, { status: 404 });
  }

  if (!deliverable.file_url) {
    return NextResponse.json({ error: "No file attached" }, { status: 404 });
  }

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from("deliverables")
    .createSignedUrl(deliverable.file_url, 3600);

  if (signedUrlError) {
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      url: signedUrl.signedUrl,
      filename: deliverable.file_name || deliverable.title,
    },
  });
}
