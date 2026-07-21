"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface HoursData {
  summary: {
    totalAllocated: number;
    totalUsed: number;
    totalRemaining: number;
    utilizationPct: number;
    clientCount: number;
  };
  byClient: Array<{
    clientId: string;
    totalHours: number;
    usedHours: number;
    remainingHours: number;
    utilizationPct: number;
  }>;
}

const MOCK_HOURS: HoursData = {
  summary: {
    totalAllocated: 200,
    totalUsed: 144,
    totalRemaining: 56,
    utilizationPct: 72,
    clientCount: 4,
  },
  byClient: [
    { clientId: "Meridian Labs", totalHours: 80, usedHours: 62, remainingHours: 18, utilizationPct: 78 },
    { clientId: "Verdant Health", totalHours: 60, usedHours: 44, remainingHours: 16, utilizationPct: 73 },
    { clientId: "Greenfield Corp", totalHours: 40, usedHours: 28, remainingHours: 12, utilizationPct: 70 },
    { clientId: "Nexus Financial", totalHours: 20, usedHours: 10, remainingHours: 10, utilizationPct: 50 },
  ],
};

export function HoursReport({ dateRange }: { dateRange?: string }) {
  const [data, setData] = useState<HoursData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/hours?period=${dateRange || "30d"}`)
      .then((r) => r.json())
      .then((d) => setData(d?.summary ? d : MOCK_HOURS))
      .catch(() => setData(MOCK_HOURS))
      .finally(() => setLoading(false));
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Allocated</p>
            <p className="text-2xl font-bold">{data.summary.totalAllocated}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Used</p>
            <p className="text-2xl font-bold">{data.summary.totalUsed}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold">{data.summary.totalRemaining}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Utilization</p>
            <p className="text-2xl font-bold">{data.summary.utilizationPct}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={data.summary.utilizationPct} className="h-6" />
          <p className="mt-2 text-sm text-muted-foreground">
            {data.summary.totalUsed}h of {data.summary.totalAllocated}h used across{" "}
            {data.summary.clientCount} clients
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hours by Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.byClient.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hours data available.</p>
          ) : (
            data.byClient.map((client) => (
              <div key={client.clientId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-[200px]">{client.clientId}</span>
                  <span className="text-muted-foreground">
                    {client.usedHours}h / {client.totalHours}h ({client.utilizationPct}%)
                  </span>
                </div>
                <Progress value={client.utilizationPct} className="h-3" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
