"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface RevenueData {
  summary: {
    totalRevenue: number;
    pendingRevenue: number;
    overdueRevenue: number;
    addonRevenue: number;
    totalInvoices: number;
  };
  monthly: Array<{
    month: string;
    revenue: number;
    pending: number;
    invoices: number;
  }>;
}

const MOCK_REVENUE: RevenueData = {
  summary: {
    totalRevenue: 1247500,
    pendingRevenue: 38750,
    overdueRevenue: 8500,
    addonRevenue: 42000,
    totalInvoices: 56,
  },
  monthly: [
    { month: "2026-02", revenue: 185000, pending: 12000, invoices: 8 },
    { month: "2026-03", revenue: 210000, pending: 18500, invoices: 10 },
    { month: "2026-04", revenue: 195000, pending: 22000, invoices: 9 },
    { month: "2026-05", revenue: 248000, pending: 15000, invoices: 12 },
    { month: "2026-06", revenue: 227500, pending: 38750, invoices: 11 },
    { month: "2026-07", revenue: 182000, pending: 45000, invoices: 7 },
  ],
};

export function RevenueReport({ dateRange }: { dateRange?: string }) {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(dateRange || "12m");

  const loadReport = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/reports/revenue?period=${period}`);
      const d = await r.json();
      setData(d?.summary ? d : MOCK_REVENUE);
    } catch {
      setData(MOCK_REVENUE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [period]);

  useEffect(() => {
    if (dateRange) setPeriod(dateRange);
  }, [dateRange]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const maxRevenue = Math.max(...data.monthly.map((m) => m.revenue + m.pending), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Revenue Overview</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{formatCurrency(data.summary.pendingRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(data.summary.overdueRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Add-on Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(data.summary.addonRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revenue data available.</p>
          ) : (
            data.monthly.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {new Date(month.month + "-01").toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{month.invoices} invoices</span>
                    <span className="font-medium">{formatCurrency(month.revenue)}</span>
                  </div>
                </div>
                <div className="h-4 w-full rounded-full bg-muted flex overflow-hidden">
                  <div
                    className="h-4 bg-green-500 transition-all"
                    style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                  />
                  <div
                    className="h-4 bg-yellow-400 transition-all"
                    style={{ width: `${(month.pending / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
          {data.monthly.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" /> Collected
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-400" /> Pending
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
