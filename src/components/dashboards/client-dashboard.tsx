"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Plus,
  Wallet,
  FileCheck,
  CreditCard,
  Calendar,
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

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  href,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActiveRequestsCard({ requests }: { requests: DashboardRequest[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Active Requests
        </CardTitle>
        <CardDescription>Your current requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.length === 0 && (
          <p className="text-sm text-muted-foreground">No active requests.</p>
        )}
        {requests.slice(0, 5).map((req) => (
          <Link
            key={req.id}
            href={`/requests/${req.id}`}
            className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{req.title}</p>
              <p className="text-xs text-muted-foreground">
                {req.pod?.name || "Unassigned"}
                {req.due_date && ` · Due ${new Date(req.due_date).toLocaleDateString()}`}
              </p>
            </div>
            <StatusBadge status={req.status} />
          </Link>
        ))}
        {requests.length > 5 && (
          <Link href="/requests" className="block text-center text-sm text-primary hover:underline pt-1">
            View all requests →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function RecentDeliverablesCard({ deliverables }: { deliverables: DashboardDeliverable[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          Recent Deliverables
        </CardTitle>
        <CardDescription>Latest deliverables from your pods</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deliverables.length === 0 && (
            <p className="text-sm text-muted-foreground">No deliverables yet.</p>
          )}
          {deliverables.slice(0, 5).map((deliverable) => (
            <Link
              key={deliverable.id}
              href={`/deliverables/${deliverable.id}`}
              className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{deliverable.title}</p>
                <p className="text-xs text-muted-foreground">
                  {deliverable.request?.title || "N/A"} · {timeAgo(deliverable.created_at)}
                </p>
              </div>
              <StatusBadge status={deliverable.status} />
            </Link>
          ))}
          {deliverables.length > 5 && (
            <Link href="/deliverables" className="block text-center text-sm text-primary hover:underline pt-1">
              View all deliverables →
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WalletCard({ wallet }: { wallet: HoursWallet | null }) {
  const pct = wallet && wallet.total_hours > 0
    ? Math.round((wallet.remaining_hours / wallet.total_hours) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
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
              <p className="text-4xl font-bold text-primary">{Math.round(wallet.remaining_hours)}</p>
              <p className="text-sm text-muted-foreground">hours remaining</p>
            </div>
            <Progress value={pct} className="h-3" />
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
  );
}

function QuickActionsCard() {
  const actions = [
    { label: "New Request", icon: Plus, color: "text-primary", href: "/requests" },
    { label: "Upload Document", icon: Upload, color: "text-blue-500", href: "/documents" },
    { label: "View Deliverables", icon: Eye, color: "text-success", href: "/deliverables" },
    { label: "View Invoices", icon: CreditCard, color: "text-purple-500", href: "/invoices" },
    { label: "Contact Team", icon: MessageSquare, color: "text-cyan-500", href: "/chat" },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common actions you can take</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm"
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-xs font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentInvoicesCard({ invoices }: { invoices: DashboardInvoice[] }) {
  if (invoices.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
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
            {invoices.slice(0, 5).map((invoice) => (
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
  );
}

function NotificationsCard({ notifications }: { notifications: DashboardNotification[] }) {
  if (notifications.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Recent Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.slice(0, 4).map((notification) => (
            <div key={notification.id} className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50">
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
  );
}

function NextMeetingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Next Meeting
        </CardTitle>
        <CardDescription>Your upcoming scheduled meeting</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="rounded-xl bg-muted/50 p-4 mb-3">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No upcoming meetings</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Meetings with your pod team will appear here once scheduled.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function ClientDashboard() {
  const { user } = useAuth();
  const userName = user?.full_name?.split(" ")[0] || "there";

  const [requests, setRequests] = useState<DashboardRequest[]>([]);
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

  if (loading) return <DashboardSkeleton />;

  const activeRequests = requests.filter((r) => !["completed", "cancelled"].includes(r.status));
  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const openCount = requests.filter((r) => r.status === "pending").length;
  const inProgressCount = requests.filter((r) => r.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent p-6">
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
              <div className="rounded-xl bg-primary/10 px-4 py-2">
                <p className="text-sm font-medium text-primary">Hours Wallet</p>
                <p className="text-2xl font-bold text-primary">
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
        <StatCard
          title="Active Requests"
          value={String(activeRequests.length)}
          icon={FileText}
          description={`${openCount} pending, ${inProgressCount} in progress`}
          href="/requests"
        />
        <StatCard
          title="Deliverables"
          value={String(deliverables.length)}
          icon={FileCheck}
          description={`${deliverables.filter((d) => d.status === "completed").length} completed`}
          href="/deliverables"
        />
        <StatCard
          title="Hours Remaining"
          value={wallet ? String(Math.round(wallet.remaining_hours)) : "--"}
          icon={Clock}
          description={wallet ? `of ${Math.round(wallet.total_hours)} total hours` : "No wallet"}
          href="/hours-wallet"
        />
        <StatCard
          title="Pending Invoices"
          value={pendingInvoices.length > 0 ? `$${pendingInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}` : "$0"}
          icon={Receipt}
          description={`${pendingInvoices.length} invoice${pendingInvoices.length !== 1 ? "s" : ""} pending`}
          href="/invoices"
        />
      </div>

      {/* Active Requests & Recent Deliverables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActiveRequestsCard requests={activeRequests} />
        <RecentDeliverablesCard deliverables={deliverables} />
      </div>

      {/* Hours Wallet & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <WalletCard wallet={wallet} />
        <QuickActionsCard />
      </div>

      {/* Recent Invoices */}
      <RecentInvoicesCard invoices={invoices} />

      {/* Notifications */}
      <NotificationsCard notifications={notifications} />

      {/* Next Meeting */}
      <NextMeetingCard />
    </div>
  );
}
