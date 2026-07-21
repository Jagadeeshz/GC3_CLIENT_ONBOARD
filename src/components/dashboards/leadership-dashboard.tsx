"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  DollarSign,
  Users,
  Layers,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

interface Client {
  id: string;
  company_name: string;
  is_active: boolean;
}

interface Pod {
  id: string;
  name: string;
  manager: { id: string; full_name: string } | null;
  members: { id: string }[];
}

interface Request {
  id: string;
  status: string;
  priority: string;
  client: { id: string; company_name: string } | null;
  pod: { id: string; name: string } | null;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  client: { id: string; company_name: string } | null;
}

interface ChangeRequest {
  id: string;
  title: string;
  status: string;
  cost_estimate: number | null;
}

export function LeadershipDashboard() {
  const { user } = useAuth();
  const userName = user?.full_name?.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const [clients, setClients] = useState<Client[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, podsRes, reqRes, invRes, crRes] = await Promise.allSettled([
          fetch("/api/clients?limit=100"),
          fetch("/api/pods?limit=50"),
          fetch("/api/requests?limit=500"),
          fetch("/api/invoices?limit=200"),
          fetch("/api/change-requests?limit=50"),
        ]);

        if (clientsRes.status === "fulfilled" && clientsRes.value.ok) {
          const d = await clientsRes.value.json();
          setClients(d.data || []);
        }
        if (podsRes.status === "fulfilled" && podsRes.value.ok) {
          const d = await podsRes.value.json();
          setPods(d.data || []);
        }
        if (reqRes.status === "fulfilled" && reqRes.value.ok) {
          const d = await reqRes.value.json();
          setRequests(d.data || []);
        }
        if (invRes.status === "fulfilled" && invRes.value.ok) {
          const d = await invRes.value.json();
          setInvoices(d.data || []);
        }
        if (crRes.status === "fulfilled" && crRes.value.ok) {
          const d = await crRes.value.json();
          setChangeRequests(d.data || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalTeamMembers = pods.reduce((sum, p) => sum + (p.members?.length || 0), 0);
  const completedRequests = requests.filter((r) => r.status === "completed");
  const pendingApprovals = changeRequests.filter((cr) => cr.status === "submitted" || cr.status === "under_review");

  const requestStatusData = [
    { name: "In Progress", value: requests.filter((r) => r.status === "in_progress").length, color: "#f5b22c" },
    { name: "Pending", value: requests.filter((r) => r.status === "pending").length, color: "#3b82f6" },
    { name: "In Review", value: requests.filter((r) => r.status === "in_review").length, color: "#a78bfa" },
    { name: "Completed", value: completedRequests.length, color: "#22c55e" },
  ].filter((d) => d.value > 0);

  const podPerformance = pods.slice(0, 10).map((p) => ({
    name: p.name.replace(" Pod", ""),
    members: p.members?.length || 0,
  }));

  const kpiCards = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: `${invoices.filter((i) => i.status === "paid").length} paid`,
      iconColor: "bg-primary/10 text-primary",
    },
    {
      title: "Active Clients",
      value: String(clients.filter((c) => c.is_active).length),
      icon: Users,
      change: `${clients.length} total`,
      iconColor: "bg-info/10 text-info",
    },
    {
      title: "Active Pods",
      value: String(pods.length),
      icon: Layers,
      change: `${totalTeamMembers} members`,
      iconColor: "bg-success/10 text-success",
    },
    {
      title: "Completion Rate",
      value: requests.length > 0 ? `${Math.round((completedRequests.length / requests.length) * 100)}%` : "0%",
      icon: TrendingUp,
      change: `${completedRequests.length}/${requests.length}`,
      iconColor: "bg-primary/10 text-primary",
    },
    {
      title: "Pending Approvals",
      value: String(pendingApprovals.length),
      icon: CheckCircle2,
      change: `${changeRequests.length} total CRs`,
      iconColor: "bg-warning/10 text-warning",
    },
    {
      title: "Open Risks",
      value: String(requests.filter((r) => r.priority === "urgent").length),
      icon: AlertTriangle,
      change: "urgent priority",
      iconColor: "bg-destructive/10 text-destructive",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {userName}</h1>
            <p className="mt-1 text-muted-foreground">Executive overview — {today}</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.iconColor}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pod Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Pod Performance
            </CardTitle>
            <CardDescription>Team size by pod</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {podPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={podPerformance} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", boxShadow: "var(--shadow-lg)" }} />
                    <Bar dataKey="members" fill="hsl(243 75% 59%)" radius={[6, 6, 0, 0]} name="Members" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No data.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Request Status
            </CardTitle>
            <CardDescription>Current status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {requestStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={requestStatusData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {requestStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", boxShadow: "var(--shadow-lg)" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No data.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Clients & Pending Approvals */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.filter((c) => c.is_active).slice(0, 5).map((client) => {
                const clientRequests = requests.filter((r) => r.client?.id === client.id);
                return (
                  <div key={client.id} className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{client.company_name}</p>
                      <p className="text-xs text-muted-foreground">{clientRequests.length} requests</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                );
              })}
              {clients.length === 0 && <p className="text-sm text-muted-foreground">No clients.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.slice(0, 5).map((cr) => (
                <div key={cr.id} className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{cr.title}</p>
                    <p className="text-xs text-muted-foreground">{cr.cost_estimate ? `$${cr.cost_estimate.toLocaleString()}` : "N/A"}</p>
                  </div>
                  <Badge>{cr.status.replace(/_/g, " ")}</Badge>
                </div>
              ))}
              {pendingApprovals.length === 0 && <p className="text-sm text-muted-foreground">No pending approvals.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
