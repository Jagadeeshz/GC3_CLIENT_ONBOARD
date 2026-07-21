"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface PlatformStats {
  users: { total: number; active: number; byRole: Record<string, number> };
  clients: { total: number; active: number };
  pods: { total: number; active: number };
  requests: { total: number; byStatus: Record<string, number> };
  revenue: number;
  hoursUsed: number;
}

export function PlatformStats() {
  const [data, setData] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    { title: "Total Users", value: data.users.total, sub: `${data.users.active} active` },
    { title: "Clients", value: data.clients.total, sub: `${data.clients.active} active` },
    { title: "Pods", value: data.pods.total, sub: `${data.pods.active} active` },
    { title: "Requests", value: data.requests.total, sub: `${Object.keys(data.requests.byStatus).length} statuses` },
    { title: "Total Revenue", value: formatCurrency(data.revenue), sub: "Paid invoices" },
    { title: "Hours Used", value: `${data.hoursUsed}h`, sub: "Across all clients" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users by Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(data.users.byRole).map(([role, count]) => {
            const pct = data.users.total > 0 ? Math.round((count / data.users.total) * 100) : 0;
            return (
              <div key={role} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{role.replace("_", " ")}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
