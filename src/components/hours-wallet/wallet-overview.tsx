"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle2, Circle } from "lucide-react";

export function WalletOverview() {
  const [wallet, setWallet] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const response = await fetch("/api/hours-wallet");
      const result = await response.json();
      if (response.ok) {
        setWallet(result.data);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No hours wallet found for your account.
        </CardContent>
      </Card>
    );
  }

  const total = Number(wallet.total_hours) || 0;
  const used = Number(wallet.used_hours) || 0;
  const remaining = total - used;
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Allocated hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Used Hours</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{used.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Hours consumed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remaining Hours</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remaining.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Hours available</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={percentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{used.toFixed(1)} used ({percentage}%)</span>
            <span>{remaining.toFixed(1)} remaining</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
