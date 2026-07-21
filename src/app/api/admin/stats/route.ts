import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET() {
  const auth = await authorize("dashboard", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const [profiles, clients, pods, requests, invoices, wallets] = await Promise.all([
    supabase.from("profiles").select("id, role, is_active, created_at"),
    supabase.from("clients").select("id, is_active, created_at"),
    supabase.from("pods").select("id, is_active, created_at"),
    supabase.from("requests").select("id, status, created_at"),
    supabase.from("invoices").select("id, amount, status"),
    supabase.from("hours_wallets").select("total_hours, used_hours"),
  ]);

  const allProfiles = profiles.data || [];
  const allClients = clients.data || [];
  const allPods = pods.data || [];
  const allRequests = requests.data || [];
  const allInvoices = invoices.data || [];
  const allWallets = wallets.data || [];

  const totalRevenue = allInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + (i.amount || 0), 0);
  const totalHoursUsed = allWallets.reduce((s, w) => s + (w.used_hours || 0), 0);

  return NextResponse.json({
    users: {
      total: allProfiles.length,
      active: allProfiles.filter((u) => u.is_active).length,
      byRole: allProfiles.reduce(
        (acc, u) => {
          acc[u.role] = (acc[u.role] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    },
    clients: {
      total: allClients.length,
      active: allClients.filter((c) => c.is_active).length,
    },
    pods: {
      total: allPods.length,
      active: allPods.filter((p) => p.is_active).length,
    },
    requests: {
      total: allRequests.length,
      byStatus: allRequests.reduce(
        (acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    },
    revenue: totalRevenue,
    hoursUsed: totalHoursUsed,
  });
}
