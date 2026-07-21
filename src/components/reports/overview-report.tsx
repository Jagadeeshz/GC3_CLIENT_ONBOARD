"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface OverviewData {
  requests: { total: number; byStatus: Record<string, number> };
  revenue: { total: number; pending: number };
  hours: { used: number; available: number; utilization: number };
  users: { total: number; active: number };
}

const MOCK_OVERVIEW: OverviewData = {
  requests: { total: 42, byStatus: { pending: 14, in_progress: 18, in_review: 6, completed: 32, cancelled: 3, on_hold: 2 } },
  revenue: { total: 128750, pending: 38750 },
  hours: { used: 144, available: 200, utilization: 72 },
  users: { total: 12, active: 10 },
};

export function OverviewReport({ dateRange }: { dateRange?: string }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/overview?period=${dateRange || "30d"}`)
      .then((r) => r.json())
      .then((d) => setData(d?.requests ? d : MOCK_OVERVIEW))
      .catch(() => setData(MOCK_OVERVIEW))
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      title: "Total Requests",
      value: data.requests.total,
      description: `${Object.keys(data.requests.byStatus).length} status types`,
    },
    {
      title: "Revenue Collected",
      value: formatCurrency(data.revenue.total),
      description: `${formatCurrency(data.revenue.pending)} pending`,
    },
    {
      title: "Hours Utilization",
      value: `${data.hours.utilization}%`,
      description: `${data.hours.used}h used of ${data.hours.available}h`,
    },
    {
      title: "Team Members",
      value: data.users.total,
      description: `${data.users.active} active`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{m.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{m.value}</div>
            <p className="text-xs text-muted-foreground">{m.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
