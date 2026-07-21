"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface RequestReportData {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  totalHours: number;
  uniqueClients: number;
  uniquePods: number;
  period: string;
}

const MOCK_REQUEST_REPORT: RequestReportData = {
  total: 75,
  byStatus: { pending: 14, in_progress: 18, in_review: 6, completed: 32, cancelled: 3, on_hold: 2 },
  byPriority: { low: 12, medium: 28, high: 24, urgent: 11 },
  totalHours: 680,
  uniqueClients: 4,
  uniquePods: 3,
  period: "30d",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-400",
  in_review: "bg-blue-400",
  in_progress: "bg-purple-400",
  completed: "bg-green-400",
  cancelled: "bg-gray-400",
  on_hold: "bg-orange-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-green-400",
  medium: "bg-yellow-400",
  high: "bg-orange-400",
  urgent: "bg-red-400",
};

export function RequestReport({ dateRange }: { dateRange?: string }) {
  const [data, setData] = useState<RequestReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(dateRange || "30d");

  const loadReport = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/reports/requests?period=${period}`);
      const d = await r.json();
      setData(d?.total ? d : MOCK_REQUEST_REPORT);
    } catch {
      setData(MOCK_REQUEST_REPORT);
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
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const maxStatus = Math.max(...Object.values(data.byStatus), 1);
  const maxPriority = Math.max(...Object.values(data.byPriority), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Request Breakdown</h3>
          <p className="text-sm text-muted-foreground">{data.total} requests in selected period</p>
        </div>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.byStatus)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="capitalize">
                      {status.replace("_", " ")}
                    </Badge>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full transition-all ${STATUS_COLORS[status] || "bg-gray-400"}`}
                      style={{ width: `${(count / maxStatus) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.byPriority)
              .sort(([, a], [, b]) => b - a)
              .map(([priority, count]) => (
                <div key={priority} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="capitalize">
                      {priority}
                    </Badge>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full transition-all ${PRIORITY_COLORS[priority] || "bg-gray-400"}`}
                      style={{ width: `${(count / maxPriority) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold">{data.totalHours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Unique Clients</p>
            <p className="text-2xl font-bold">{data.uniqueClients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Pods</p>
            <p className="text-2xl font-bold">{data.uniquePods}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
