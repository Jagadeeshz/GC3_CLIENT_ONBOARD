import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("report", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "12m";

  const monthsBack = period === "3m" ? 3 : period === "6m" ? 6 : 12;
  const since = new Date();
  since.setMonth(since.getMonth() - monthsBack);
  const sinceStr = since.toISOString();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, amount, currency, status, client_id, created_at, due_date, is_addon")
    .gte("created_at", sinceStr)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const all = invoices || [];

  const totalRevenue = all.filter((i) => i.status === "paid").reduce((s, i) => s + (i.amount || 0), 0);
  const pendingRevenue = all.filter((i) => i.status === "pending").reduce((s, i) => s + (i.amount || 0), 0);
  const overdueRevenue = all.filter((i) => i.status === "overdue").reduce((s, i) => s + (i.amount || 0), 0);
  const addonRevenue = all.filter((i) => i.is_addon && i.status === "paid").reduce((s, i) => s + (i.amount || 0), 0);

  const monthlyMap: Record<string, { month: string; revenue: number; pending: number; invoices: number }> = {};
  for (const inv of all) {
    const month = inv.created_at.slice(0, 7);
    if (!monthlyMap[month]) {
      monthlyMap[month] = { month, revenue: 0, pending: 0, invoices: 0 };
    }
    monthlyMap[month].invoices += 1;
    if (inv.status === "paid") {
      monthlyMap[month].revenue += inv.amount || 0;
    } else if (inv.status === "pending") {
      monthlyMap[month].pending += inv.amount || 0;
    }
  }

  const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  const byStatus = all.reduce(
    (acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + (i.amount || 0);
      return acc;
    },
    {} as Record<string, number>
  );

  return NextResponse.json({
    summary: {
      totalRevenue,
      pendingRevenue,
      overdueRevenue,
      addonRevenue,
      totalInvoices: all.length,
    },
    monthly,
    byStatus,
  });
}
