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
  Briefcase,
  FileText,
  Clock,
  Receipt,
  Upload,
  Eye,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Bell,
  ArrowUpRight,
  Plus,
  Wallet,
  FileCheck,
  CreditCard,
} from "lucide-react";

interface DashboardRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  pod: { id: string; name: string } | null;
}

interface DashboardDeliverable {
  id: string;
  title: string;
  status: string;
  created_at: string;
  request: { id: string; title: string } | null;
}

interface DashboardInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

interface HoursWallet {
  id: string;
  total_hours: number;
  used_hours: number;
  remaining_hours: number;
  billing_period_start: string | null;
  billing_period_end: string | null;
}

interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    completed: "success",
    in_review: "warning",
    in_progress: "default",
    pending: "warning",
    on_track: "success",
    at_risk: "warning",
    paid: "success",
    overdue: "destructive",
    draft: "secondary",
  };
  return <Badge variant={variants[status] || "secondary"}>{status.replace(/_/g, " ")}</Badge>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ClientDashboard() {
  const { user } = useAuth();
  const userName = user?.full_name?.split(" ")[0] || "there";

  const [requests, setRequests] = useState<DashboardRequest[]>([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [deliverables, setDeliverables] = useState<DashboardDeliverable[]>([]);
  const [invoices, setInvoices] = useState<DashboardInvoice[]>([]);
  const [wallet, setWallet] = useState<HoursWallet | null>(null);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, delRes, invRes, walletRes, notifRes] = await Promise.allSettled([
          fetch("/api/requests?limit=50"),
          fetch("/api/deliverables?limit=50"),
          fetch("/api/invoices?limit=10"),
          fetch("/api/hours-wallet"),
          fetch("/api/notifications?limit=10"),
        ]);

        if (reqRes.status === "fulfilled" && reqRes.value.ok) {
          const reqData = await reqRes.value.json();
          setRequests(reqData.data || []);
          setRequestsTotal(reqData.total || 0);
        }

        if (delRes.status === "fulfilled" && delRes.value.ok) {
          const delData = await delRes.value.json();
          setDeliverables(delData.data || []);
        }

        if (invRes.status === "fulfilled" && invRes.value.ok) {
          const invData = await invRes.value.json();
          setInvoices(invData.data || []);
        }

        if (walletRes.status === "fulfilled" && walletRes.value.ok) {
          const wData = await walletRes.value.json();
          setWallet(wData.data);
        }

        if (notifRes.status === "fulfilled" && notifRes.value.ok) {
          const nData = await notifRes.value.json();
          setNotifications(nData.data || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeRequests = requests.filter((r) => !["completed", "cancelled"].includes(r.status));
  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const openCount = requests.filter((r) => r.status === "pending").length;
  const inProgressCount = requests.filter((r) => r.status === "in_progress").length;
  const walletPct = wallet && wallet.total_hours > 0
    ? Math.round((wallet.remaining_hours / wallet.total_hours) * 100)
    : 0;

  const statCards = [
    {
      title: "Active Requests",
      value: String(activeRequests.length),
      icon: FileText,
      description: `${openCount} pending, ${inProgressCount} in progress`,
    },
    {
      title: "Deliverables",
      value: String(deliverables.length),
      icon: FileCheck,
      description: `${deliverables.filter((d) => d.status === "completed").length} completed`,
    },
    {
      title: "Hours Remaining",
      value: wallet ? String(Math.round(wallet.remaining_hours)) : "--",
      icon: Clock,
      description: wallet ? `of ${Math.round(wallet.total_hours)} total hours` : "No wallet",
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices.length > 0 ? `$${pendingInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}` : "$0",
      icon: Receipt,
      description: `${pendingInvoices.length} invoice${pendingInvoices.length !== 1 ? "s" : ""} pending`,
    },
  ];

  const recentDeliverables = deliverables.slice(0, 5);
  const recentInvoices = invoices.slice(0, 5);
  const recentNotifications = notifications.slice(0, 4);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
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
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s an overview of your projects and account status.
            </p>
          </div>
          {wallet && (
            <div className="hidden md:block">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2">
                <p className="text-sm font-medium text-amber-500">Hours Wallet</p>
                <p className="text-2xl font-bold text-amber-500">
                  {Math.round(wallet.remaining_hours)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {Math.round(wallet.total_hours)} hrs
                  </span>
                </p>
              </div>
            </div>
          )}
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

      {/* Active Requests & Recent Deliverables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amber-500" />
              Active Requests
            </CardTitle>
            <CardDescription>Your current requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeRequests.length === 0 && (
              <p className="text-sm text-muted-foreground">No active requests.</p>
            )}
            {activeRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{req.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.pod?.name || "Unassigned"}
                    {req.due_date && ` · Due ${new Date(req.due_date).toLocaleDateString()}`}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-amber-500" />
              Recent Deliverables
            </CardTitle>
            <CardDescription>Latest deliverables from your pods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDeliverables.length === 0 && (
                <p className="text-sm text-muted-foreground">No deliverables yet.</p>
              )}
              {recentDeliverables.map((deliverable) => (
                <div key={deliverable.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{deliverable.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {deliverable.request?.title || "N/A"} · {timeAgo(deliverable.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={deliverable.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hours Wallet & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hours Wallet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-500" />
              Hours Wallet
            </CardTitle>
            <CardDescription>
              {wallet?.billing_period_start && wallet?.billing_period_end
                ? `Billing: ${new Date(wallet.billing_period_start).toLocaleDateString()} – ${new Date(wallet.billing_period_end).toLocaleDateString()}`
                : "No active billing period"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wallet ? (
              <>
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-500">{Math.round(wallet.remaining_hours)}</p>
                  <p className="text-sm text-muted-foreground">hours remaining</p>
                </div>
                <Progress value={walletPct} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(wallet.used_hours)} hours used</span>
                  <span>{Math.round(wallet.total_hours)} hours total</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No wallet data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common actions you can take</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {[
                { label: "New Request", icon: Plus, color: "text-amber-500", href: "/requests" },
                { label: "Upload Document", icon: Upload, color: "text-blue-500", href: "/documents" },
                { label: "View Deliverables", icon: Eye, color: "text-green-500", href: "/deliverables" },
                { label: "View Invoices", icon: CreditCard, color: "text-purple-500", href: "/invoices" },
                { label: "Contact Team", icon: MessageSquare, color: "text-cyan-500", href: "/chat" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      {recentInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-500" />
              Recent Invoices
            </CardTitle>
            <CardDescription>Your latest invoices and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell className="font-semibold">${invoice.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell><StatusBadge status={invoice.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {recentNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="mt-0.5">
                    {notification.type === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    {notification.type === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {notification.type === "info" && <Bell className="h-4 w-4 text-blue-500" />}
                    {notification.type === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo(notification.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
