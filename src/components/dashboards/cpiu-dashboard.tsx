"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Users,
  Layers,
  Receipt,
  ClipboardList,
  UserPlus,
  BarChart3,
  TrendingUp,
  DollarSign,
} from "lucide-react";

interface Client {
  id: string;
  company_name: string;
  industry: string;
  is_active: boolean;
  created_at: string;
  profile: { id: string; full_name: string } | null;
}

interface Pod {
  id: string;
  name: string;
  manager: { id: string; full_name: string } | null;
  members: { id: string; member: { id: string; full_name: string } | null }[];
  created_at: string;
}

interface Request {
  id: string;
  title: string;
  status: string;
  priority: string;
  pod: { id: string; name: string } | null;
  client: { id: string; company_name: string } | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
  client: { id: string; company_name: string } | null;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    active: "success",
    onboarding: "warning",
    pending: "warning",
    overdue: "destructive",
    in_progress: "default",
    in_review: "warning",
    completed: "success",
    paid: "success",
  };
  return <Badge variant={variants[status] || "secondary"}>{status.replace(/_/g, " ")}</Badge>;
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

export function CPIUDashboard() {
  const { user } = useAuth();
  const userName = user?.full_name?.split(" ")[0] || "there";

  const [clients, setClients] = useState<Client[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, podsRes, reqRes, invRes] = await Promise.allSettled([
          fetch("/api/clients?limit=100"),
          fetch("/api/pods?limit=50"),
          fetch("/api/requests?limit=200"),
          fetch("/api/invoices?limit=100"),
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
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  const activeRequests = requests.filter((r) => !["completed", "cancelled"].includes(r.status));
  const totalTeamMembers = pods.reduce((sum, p) => sum + (p.members?.length || 0), 0);

  const requestStatusData = [
    { name: "In Progress", value: requests.filter((r) => r.status === "in_progress").length, color: "hsl(243 75% 59%)" },
    { name: "Pending", value: requests.filter((r) => r.status === "pending").length, color: "hsl(217 91% 60%)" },
    { name: "In Review", value: requests.filter((r) => r.status === "in_review").length, color: "hsl(243 75% 69%)" },
    { name: "Completed", value: requests.filter((r) => r.status === "completed").length, color: "hsl(142 71% 45%)" },
  ].filter((d) => d.value > 0);

  const statCards = [
    {
      title: "Total Clients",
      value: String(clients.length),
      icon: Users,
      description: `${clients.filter((c) => c.is_active).length} active`,
    },
    {
      title: "Active Pods",
      value: String(pods.length),
      icon: Layers,
      description: `${totalTeamMembers} team members`,
    },
    {
      title: "Pending Payments",
      value: `$${pendingInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`,
      icon: Receipt,
      description: `${pendingInvoices.length} invoices pending`,
    },
    {
      title: "Active Requests",
      value: String(activeRequests.length),
      icon: ClipboardList,
      description: `of ${requests.length} total`,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
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
            <p className="mt-1 text-muted-foreground">Platform overview and management dashboard.</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm text-muted-foreground">Platform Health</p>
            <p className="text-2xl font-bold text-success">Excellent</p>
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Request Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {requestStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={requestStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
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

        {/* Active Pods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Active Pods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pod</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pods.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-sm text-muted-foreground">No pods.</TableCell></TableRow>
                )}
                {pods.slice(0, 8).map((pod) => (
                  <TableRow key={pod.id}>
                    <TableCell className="font-medium">{pod.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{pod.manager?.full_name || "N/A"}</TableCell>
                    <TableCell className="text-sm">{pod.members?.length || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments & Active Requests */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...pendingInvoices, ...overdueInvoices].slice(0, 5).map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium text-sm">{invoice.invoice_number}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{invoice.client?.company_name || "N/A"}</TableCell>
                    <TableCell className="font-semibold text-sm">${invoice.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell><StatusBadge status={invoice.status} /></TableCell>
                  </TableRow>
                ))}
                {pendingInvoices.length === 0 && overdueInvoices.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No pending payments.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Active Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Active Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeRequests.slice(0, 6).map((request) => (
                <div key={request.id} className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{request.title}</p>
                    <p className="text-xs text-muted-foreground">{request.client?.company_name || "N/A"} · {request.pod?.name || "Unassigned"}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <PriorityBadge priority={request.priority} />
                    <StatusBadge status={request.status} />
                  </div>
                </div>
              ))}
              {activeRequests.length === 0 && (
                <p className="text-sm text-muted-foreground">No active requests.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Platform management actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[
              { label: "Create Client", icon: UserPlus, color: "text-primary", href: "/clients" },
              { label: "Assign Pod", icon: Layers, color: "text-blue-500", href: "/pod" },
              { label: "Generate Reports", icon: BarChart3, color: "text-success", href: "/reports" },
              { label: "Manage Invoices", icon: Receipt, color: "text-purple-500", href: "/invoices" },
              { label: "View Analytics", icon: TrendingUp, color: "text-cyan-500", href: "/analytics" },
            ].map((action) => (
              <a key={action.label} href={action.href} className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm">
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
