import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET() {
  const auth = await authorize("report", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();

  const [requestsResult, hoursResult, revenueResult, usersResult] = await Promise.all([
    supabase.from("requests").select("id, status, priority, actual_hours, assigned_to, created_at"),
    supabase.from("hours_wallets").select("total_hours, used_hours, remaining_hours"),
    supabase.from("invoices").select("amount, status, created_at"),
    supabase.from("profiles").select("id, role, is_active"),
  ]);

  const requests = requestsResult.data || [];
  const wallets = hoursResult.data || [];
  const invoices = revenueResult.data || [];
  const users = usersResult.data || [];

  const totalRequests = requests.length;
  const requestsByStatus = requests.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalHoursUsed = wallets.reduce((sum, w) => sum + (w.used_hours || 0), 0);
  const totalHoursAvailable = wallets.reduce((sum, w) => sum + (w.total_hours || 0), 0);
  const hoursUtilization = totalHoursAvailable > 0 ? Math.round((totalHoursUsed / totalHoursAvailable) * 100) : 0;

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (i.amount || 0), 0);
  const pendingRevenue = invoices
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const usersByRole = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const hoursByRole: Record<string, number> = {};
  for (const r of requests) {
    if (r.actual_hours && r.assigned_to) {
      const assignee = users.find((u) => u.id === r.assigned_to);
      if (assignee) {
        hoursByRole[assignee.role] = (hoursByRole[assignee.role] || 0) + r.actual_hours;
      }
    }
  }

  return NextResponse.json({
    requests: {
      total: totalRequests,
      byStatus: requestsByStatus,
    },
    revenue: {
      total: totalRevenue,
      pending: pendingRevenue,
    },
    hours: {
      used: totalHoursUsed,
      available: totalHoursAvailable,
      utilization: hoursUtilization,
      byRole: hoursByRole,
    },
    users: {
      total: totalUsers,
      active: activeUsers,
      byRole: usersByRole,
    },
  });
}
