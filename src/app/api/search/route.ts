import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  description: string | null;
  url: string;
  meta: Record<string, unknown>;
}

export async function GET(request: NextRequest) {
  const auth = await authorize("request", "read");
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const supabase = await createSupabaseServerClient();
  const results: SearchResult[] = [];

  const [requestsRes, deliverablesRes, documentsRes, invoicesRes, clientsRes, feedbackRes] =
    await Promise.all([
      supabase
        .from("requests")
        .select("id, title, description, status, created_at")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5),
      supabase
        .from("deliverables")
        .select("id, title, description, status, created_at")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5),
      supabase
        .from("documents")
        .select("id, title, description, category, file_name, created_at")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5),
      supabase
        .from("invoices")
        .select("id, invoice_number, amount, status, description, created_at")
        .or(`invoice_number.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5),
      supabase
        .from("clients")
        .select("id, company_name, industry")
        .or(`company_name.ilike.%${query}%,industry.ilike.%${query}%`)
        .limit(5),
      supabase
        .from("feedback")
        .select("id, comment, rating, type, created_at")
        .ilike("comment", `%${query}%`)
        .limit(5),
    ]);

  if (requestsRes.data) {
    for (const r of requestsRes.data) {
      results.push({
        type: "request",
        id: r.id,
        title: r.title,
        description: r.description,
        url: `/requests/${r.id}`,
        meta: { status: r.status },
      });
    }
  }

  if (deliverablesRes.data) {
    for (const d of deliverablesRes.data) {
      results.push({
        type: "deliverable",
        id: d.id,
        title: d.title,
        description: d.description,
        url: `/deliverables/${d.id}`,
        meta: { status: d.status },
      });
    }
  }

  if (documentsRes.data) {
    for (const d of documentsRes.data) {
      results.push({
        type: "document",
        id: d.id,
        title: d.title,
        description: d.description || d.file_name,
        url: `/documents`,
        meta: { category: d.category },
      });
    }
  }

  if (invoicesRes.data) {
    for (const inv of invoicesRes.data) {
      results.push({
        type: "invoice",
        id: inv.id,
        title: inv.invoice_number,
        description: inv.description,
        url: `/invoices/${inv.id}`,
        meta: { amount: inv.amount, status: inv.status },
      });
    }
  }

  if (clientsRes.data) {
    for (const c of clientsRes.data) {
      results.push({
        type: "client",
        id: c.id,
        title: c.company_name,
        description: c.industry,
        url: `/clients/${c.id}`,
        meta: {},
      });
    }
  }

  if (feedbackRes.data) {
    for (const f of feedbackRes.data) {
      results.push({
        type: "feedback",
        id: f.id,
        title: `${f.type} feedback`,
        description: f.comment,
        url: `/feedback`,
        meta: { rating: f.rating },
      });
    }
  }

  return NextResponse.json({ data: results, total: results.length });
}
