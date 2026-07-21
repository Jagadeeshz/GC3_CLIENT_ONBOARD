import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(request: NextRequest) {
  const auth = await authorize("report", "read");
  if (!auth.authorized) return auth.response;

  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);

  const period = searchParams.get("period") || "30d";
  const daysAgo = period === "7d" ? 7 : period === "90d" ? 90 : period === "365d" ? 365 : 30;
  const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  const { data: requests, error } = await supabase
    .from("requests")
    .select("id, status, priority, actual_hours, created_at, client_id, pod_id")
    .gte("created_at", since);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const all = requests || [];

  const byStatus = all.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const byPriority = all.reduce(
    (acc, r) => {
      acc[r.priority] = (acc[r.priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const byDay = all.reduce(
    (acc, r) => {
      const day = r.created_at.slice(0, 10);
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalHours = all.reduce((sum, r) => sum + (r.actual_hours || 0), 0);
  const uniqueClients = new Set(all.map((r) => r.client_id)).size;
  const uniquePods = new Set(all.map((r) => r.pod_id).filter(Boolean)).size;

  return NextResponse.json({
    total: all.length,
    byStatus,
    byPriority,
    byDay,
    totalHours,
    uniqueClients,
    uniquePods,
    period,
  });
}
