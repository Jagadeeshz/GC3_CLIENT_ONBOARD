"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Ticket,
  CheckCircle2,
  Gauge,
  Receipt,
  Users,
  Clock,
  ArrowUpRight,
  Settings,
  BarChart3,
} from "lucide-react";

interface Request {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  client: { id: string; company_name: string } | null;
  pod: { id: string; name: string } | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
}

interface Pod {
  id: string;
  name: string;
  members: { id: string }[];
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    urgent: "destructive",
    high: "warning",
    medium: "default",
    low: "secondary",
  };
  return <Badge variant={variants[priority] || "secondary"}>{priority}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    open: "warning",
    in_progress: "default",
    resolved: "success",
    closed: "secondary",
    paid: "success",
    pending: "warning",
    overdue: "destructive",
  };
  return <Badge variant={variants[status] || "secondary"}>{status.replace(/_/g, " ")}</Badge>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function OperationsDashboard() {
  const { user } = useAuth();
  const userName = user?.full_name?.split(" ")[0] || "there";

  const [requests, setRequests] = useState<Request[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, invRes, podsRes] = await Promise.allSettled([
          fetch("/api/requests?limit=100"),
          fetch("/api/invoices?limit=100"),
          fetch("/api/pods?limit=50"),
        ]);

        if (reqRes.status === "fulfilled" && reqRes.value.ok) {
          const d = await reqRes.value.json();
          setRequests(d.data || []);
        }
        if (invRes.status === "fulfilled" && invRes.value.ok) {
          const d = await invRes.value.json();
          setInvoices(d.data || []);
        }
        if (podsRes.status === "fulfilled" && podsRes.value.ok) {
          const d = await podsRes.value.json();
          setPods(d.data || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openTickets = requests.filter((r) => r.status === "pending");
  const inProgressTickets = requests.filter((r) => r.status === "in_progress");
  const resolvedTickets = requests.filter((r) => r.status === "completed");
  const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "overdue");
  const paidInvoices = invoices.filter((i) => i.status === "paid");

  const resourceAllocation = pods.map((p) => {
    const podRequests = requests.filter((r) => r.pod?.id === p.id && r.status !== "completed");
    const totalMembers = p.members?.length || 1;
    const allocated = Math.min(100, Math.round((podRequests.length / totalMembers) * 30));
    return {
      name: p.name,
      allocated,
      members: totalMembers,
      projects: podRequests.length,
      status: allocated > 90 ? "overloaded" : allocated < 40 ? "underutilized" : "optimal",
    };
  });

  const invoiceSummary = [
    { status: "Paid", count: paidInvoices.length, amount: paidInvoices.reduce((s, i) => s + i.amount, 0) },
    { status: "Pending", count: invoices.filter((i) => i.status === "pending").length, amount: invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0) },
    { status: "Overdue", count: invoices.filter((i) => i.status === "overdue").length, amount: invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0) },
  ];

  const statCards = [
    {
      title: "Open Tickets",
      value: String(openTickets.length),
      icon: Ticket,
      description: `${openTickets.filter((r) => r.priority === "high" || r.priority === "urgent").length} high priority`,
    },
    {
      title: "In Progress",
      value: String(inProgressTickets.length),
      icon: Clock,
      description: "currently being worked on",
    },
    {
      title: "Resolved",
      value: String(resolvedTickets.length),
      icon: CheckCircle2,
      description: `of ${requests.length} total requests`,
    },
    {
      title: "Pending Invoices",
      value: `$${pendingInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`,
      icon: Receipt,
      description: `${pendingInvoices.length} invoices pending`,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {userName}</h1>
            <p className="mt-1 text-muted-foreground">Operations center — monitoring tickets, resources, and system health.</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-500">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
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

      {/* Resource Allocation & Invoice Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resource Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Resource Allocation
            </CardTitle>
            <CardDescription>Pod utilization across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resourceAllocation.length === 0 && <p className="text-sm text-muted-foreground">No pods.</p>}
              {resourceAllocation.map((resource) => (
                <div key={resource.name} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-24 truncate">{resource.name}</span>
                  <div className="flex-1">
                    <Progress value={resource.allocated} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{resource.allocated}%</span>
                  <StatusBadge status={resource.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-500" />
              Invoice Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoiceSummary.map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={item.status.toLowerCase()} />
                    <span className="text-sm font-semibold">${item.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.count} invoices</p>
                </div>
              ))}
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold">${invoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-amber-500" />
            Recent Requests
          </CardTitle>
          <CardDescription>Latest requests across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests.slice(0, 8).map((request) => (
              <div key={request.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{request.title}</p>
                  <p className="text-xs text-muted-foreground">{request.client?.company_name || "N/A"} · {request.pod?.name || "Unassigned"} · {timeAgo(request.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <PriorityBadge priority={request.priority} />
                  <StatusBadge status={request.status} />
                </div>
              </div>
            ))}
            {requests.length === 0 && <p className="text-sm text-muted-foreground">No requests.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[
              { label: "Manage Operations", icon: Settings, color: "text-amber-500", href: "/pod" },
              { label: "Resolve Tickets", icon: Ticket, color: "text-blue-500", href: "/requests" },
              { label: "Generate Reports", icon: BarChart3, color: "text-green-500", href: "/reports" },
              { label: "Resource Planning", icon: Users, color: "text-purple-500", href: "/pod" },
              { label: "Invoice Management", icon: Receipt, color: "text-cyan-500", href: "/invoices" },
            ].map((action) => (
              <a key={action.label} href={action.href} className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <span className="text-xs font-medium text-center">{action.label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
