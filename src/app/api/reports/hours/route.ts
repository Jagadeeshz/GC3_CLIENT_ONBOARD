import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("report", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");

  let walletQuery = supabase
    .from("hours_wallets")
    .select("id, client_id, total_hours, used_hours, remaining_hours, billing_period_start, billing_period_end");

  if (clientId) {
    walletQuery = walletQuery.eq("client_id", clientId);
  }

  const { data: wallets, error: walletError } = await walletQuery;

  if (walletError) {
    return NextResponse.json({ error: walletError.message }, { status: 500 });
  }

  const walletIds = (wallets || []).map((w) => w.id);

  let transactions: Array<{ wallet_id: string; hours: number; type: string; created_at: string }> = [];
  if (walletIds.length > 0) {
    const { data } = await supabase
      .from("hours_transactions")
      .select("wallet_id, hours, type, created_at")
      .in("wallet_id", walletIds)
      .order("created_at", { ascending: false });
    transactions = data || [];
  }

  const totalAllocated = (wallets || []).reduce((sum, w) => sum + (w.total_hours || 0), 0);
  const totalUsed = (wallets || []).reduce((sum, w) => sum + (w.used_hours || 0), 0);
  const totalRemaining = (wallets || []).reduce((sum, w) => sum + (w.remaining_hours || 0), 0);
  const utilizationPct = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;

  const byClient = (wallets || []).map((w) => ({
    clientId: w.client_id,
    totalHours: w.total_hours,
    usedHours: w.used_hours,
    remainingHours: w.remaining_hours,
    utilizationPct: w.total_hours > 0 ? Math.round((w.used_hours / w.total_hours) * 100) : 0,
    billingPeriodStart: w.billing_period_start,
    billingPeriodEnd: w.billing_period_end,
  }));

  const recentTransactions = transactions.slice(0, 20);

  return NextResponse.json({
    summary: {
      totalAllocated,
      totalUsed,
      totalRemaining,
      utilizationPct,
      clientCount: (wallets || []).length,
    },
    byClient,
    recentTransactions,
  });
}
