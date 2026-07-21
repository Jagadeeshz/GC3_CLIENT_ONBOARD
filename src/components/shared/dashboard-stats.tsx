"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Package, Receipt, Clock } from "lucide-react";
import type { UserRole } from "@/types";

interface DashboardStatsProps {
  userId: string;
  role: UserRole;
}

interface Stats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalDeliverables: number;
  totalInvoices: number;
  pendingInvoices: number;
  hoursUsed: number;
  hoursRemaining: number;
}

export function DashboardStats({ userId, role }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalDeliverables: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    hoursUsed: 0,
    hoursRemaining: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createSupabaseClient();

      try {
        if (role === "client") {
          const { data: client } = await supabase
            .from("clients")
            .select("id")
            .eq("profile_id", userId)
            .single();

          if (client) {
            const [requestsRes, invoicesRes, walletRes] = await Promise.all([
              supabase.from("requests").select("id, status").eq("client_id", client.id),
              supabase.from("invoices").select("id, amount, status").eq("client_id", client.id),
              supabase.from("hours_wallet").select("total_hours, used_hours").eq("client_id", client.id).single(),
            ]);

            const requests = requestsRes.data || [];
            const invoices = invoicesRes.data || [];

            setStats({
              totalRequests: requests.length,
              pendingRequests: requests.filter(r => ["pending", "in_review", "in_progress"].includes(r.status)).length,
              completedRequests: requests.filter(r => r.status === "completed").length,
              totalDeliverables: 0,
              totalInvoices: invoices.length,
              pendingInvoices: invoices.filter(i => ["draft", "pending"].includes(i.status)).length,
              hoursUsed: Number(walletRes.data?.used_hours) || 0,
              hoursRemaining: Number(walletRes.data?.total_hours || 0) - Number(walletRes.data?.used_hours || 0),
            });
          }
        } else {
          const [requestsRes, deliverablesRes, invoicesRes] = await Promise.all([
            supabase.from("requests").select("id, status"),
            supabase.from("deliverables").select("id"),
            supabase.from("invoices").select("id, status"),
          ]);

          const requests = requestsRes.data || [];
          const invoices = invoicesRes.data || [];

          setStats({
            totalRequests: requests.length,
            pendingRequests: requests.filter(r => ["pending", "in_review", "in_progress"].includes(r.status)).length,
            completedRequests: requests.filter(r => r.status === "completed").length,
            totalDeliverables: deliverablesRes.data?.length || 0,
            totalInvoices: invoices.length,
            pendingInvoices: invoices.filter(i => ["draft", "pending"].includes(i.status)).length,
            hoursUsed: 0,
            hoursRemaining: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, role]);

  const statCards = [
    {
      title: "Total Requests",
      value: stats.totalRequests,
      icon: FileText,
      description: `${stats.pendingRequests} active`,
    },
    {
      title: "Deliverables",
      value: stats.totalDeliverables,
      icon: Package,
      description: `${stats.completedRequests} completed`,
    },
    {
      title: "Invoices",
      value: stats.totalInvoices,
      icon: Receipt,
      description: `${stats.pendingInvoices} pending`,
    },
    ...(role === "client"
      ? [
          {
            title: "Hours Used",
            value: stats.hoursUsed,
            icon: Clock,
            description: `${stats.hoursRemaining} remaining`,
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-1 h-3 w-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
