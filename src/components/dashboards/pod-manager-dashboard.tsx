"use client";

import { useEffect, useState, useCallback } from "react";
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
import { QuickActions } from "@/components/shared/quick-actions";
import { ActivityFeed } from "@/components/shared/activity-feed";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ClipboardList,
  Users,
  CheckCircle2,
  FileText,
  BarChart3,
  Clock,
  Package,
  Bell,
  Calendar,
  AlertCircle,
  Download,
  Activity,
  Target,
  Briefcase,
  Circle,
} from "lucide-react";
import { format, isAfter, addDays } from "date-fns";

interface PodRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number;
  assigned_to: string | null;
  assignee: { id: string; full_name: string } | null;
  client: { id: string; company_name: string } | null;
  created_at: string;
}

interface PodMember {
  id: string;
  member: { id: string; full_name: string; role: string; avatar_url: string | null } | null;
}

interface PodInfo {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  manager: { id: string; full_name: string } | null;
  members: PodMember[];
}

interface ChangeRequest {
  id: string;
  title: string;
  status: string;
  cost_estimate: number | null;
  estimated_hours: number | null;
  client: { id: string; company_name: string } | null;
}

interface DashboardDeliverable {
  id: string;
  title: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  file_name: string | null;
  request: { id: string; title: string } | null;
}

interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
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
    under_review: "warning",
    submitted: "default",
    approved: "success",
    rejected: "destructive",
    pending: "secondary",
    in_progress: "default",
    in_review: "warning",
    completed: "success",
    cancelled: "destructive",
  };
  return <Badge variant={variants[status] || "secondary"}>{status.replace(/_/g, " ")}</Badge>;
}

function DeliverableStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    pending: "secondary",
    submitted: "default",
    in_review: "warning",
    approved: "success",
    rejected: "destructive",
  };
  return <Badge variant={variants[status] || "secondary"}>{status.replace(/_/g, " ")}</Badge>;
}

export function PodManagerDashboard() {
  const { user } = useAuth();
  const userName = user?.full_name?.split(" ")[0] || "there";

  const [pod, setPod] = useState<PodInfo | null>(null);
  const [requests, setRequests] = useState<PodRequest[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [deliverables, setDeliverables] = useState<DashboardDeliverable[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const podRes = await fetch("/api/pods/my");
      let podId = "";
      if (podRes.ok) {
        const podData = await podRes.json();
        const pods = podData.data || [];
        if (pods.length > 0) {
          setPod(pods[0]);
          podId = pods[0].id;
        }
      }

      const [reqRes, crRes, delRes, notifRes] = await Promise.allSettled([
        fetch(`/api/requests?limit=100&pod_id=${podId}`),
        fetch("/api/change-requests?limit=20"),
        fetch(`/api/deliverables?limit=10`),
        fetch("/api/notifications?limit=10"),
      ]);

      if (reqRes.status === "fulfilled" && reqRes.value.ok) {
        const reqData = await reqRes.value.json();
        setRequests(reqData.data || []);
      }

      if (crRes.status === "fulfilled" && crRes.value.ok) {
        const crData = await crRes.value.json();
        setChangeRequests(crData.data || []);
      }

      if (delRes.status === "fulfilled" && delRes.value.ok) {
        const delData = await delRes.value.json();
        setDeliverables(delData.data || []);
      }

      if (notifRes.status === "fulfilled" && notifRes.value.ok) {
        const notifData = await notifRes.value.json();
        setNotifications(notifData.data || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const members = pod?.members || [];
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const activeRequests = requests.filter((r) => r.status === "in_progress" || r.status === "pending");
  const completedRequests = requests.filter((r) => r.status === "completed");
  const reviewRequests = requests.filter((r) => r.status === "in_review");

  const busyMembers = members.filter((m) => {
    const cnt = requests.filter((r) => r.assigned_to === m.member?.id && r.status !== "completed").length;
    return cnt > 0;
  }).length;
  const availableMembers = members.length - busyMembers;

  const totalEstimatedHours = requests.reduce((sum, r) => sum + (r.estimated_hours || 0), 0);
  const totalActualHours = requests.reduce((sum, r) => sum + (r.actual_hours || 0), 0);
  const hoursRemaining = Math.max(0, totalEstimatedHours - totalActualHours);
  const hoursProgress = totalEstimatedHours > 0
    ? Math.min(100, Math.round((totalActualHours / totalEstimatedHours) * 100))
    : 0;

  const upcomingDeadlines = requests
    .filter((r) => r.due_date && r.status !== "completed" && r.status !== "cancelled")
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .filter((r) => isAfter(new Date(r.due_date!), new Date()));

  const utilizationPct = members.length > 0
    ? Math.round((busyMembers / members.length) * 100)
    : 0;

  const recentDeliverables = deliverables.slice(0, 5);
  const latestNotifications = notifications.slice(0, 5);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const teamProductivity = members.map((m) => {
    const memberRequests = requests.filter((r) => r.assigned_to === m.member?.id);
    const firstName = m.member?.full_name?.split(" ")[0] || "??";
    return {
      name: firstName,
      completed: memberRequests.filter((r) => r.status === "completed").length,
      inProgress: memberRequests.filter((r) => r.status === "in_progress").length,
    };
  });

  const activities = requests.slice(0, 8).map((r) => ({
    id: r.id,
    action: `assigned to ${r.assignee?.full_name || "unassigned"}`,
    entity: "request",
    entityName: r.title,
    user: r.client?.company_name || "Client",
    timestamp: r.created_at || new Date().toISOString(),
    icon: FileText,
  }));

  const statCards = [
    {
      title: "Active Requests",
      value: String(activeRequests.length),
      icon: ClipboardList,
      description: `${pendingRequests.length} pending, ${requests.filter((r) => r.status === "in_progress").length} in progress`,
    },
    {
      title: "Pending Reviews",
      value: String(reviewRequests.length),
      icon: FileText,
      description: `${reviewRequests.length} awaiting review`,
    },
    {
      title: "Team Members",
      value: String(members.length),
      icon: Users,
      description: `${busyMembers} busy, ${availableMembers} available`,
    },
    {
      title: "Completed",
      value: String(completedRequests.length),
      icon: CheckCircle2,
      description: `of ${requests.length} total requests`,
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
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, {userName}
              </h1>
              <Badge variant={pod?.is_active ? "default" : "secondary"}>
                {pod?.is_active ? "Active" : "Inactive"} Pod
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground">
              {pod?.name ? `Managing ${pod.name}` : "Manage your pod's tasks, reviews, and team productivity."}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="rounded-xl bg-primary/10 px-4 py-2">
              <p className="text-sm font-medium text-primary">Team Utilization</p>
              <p className="text-2xl font-bold text-primary">{utilizationPct}%</p>
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

      {/* Hours Tracking & Pod Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hours Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Hours Tracking
            </CardTitle>
            <CardDescription>Estimated vs actual hours across all requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{totalEstimatedHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Allocated Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{totalActualHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Used Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{hoursRemaining.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{hoursProgress}%</span>
              </div>
              <Progress value={hoursProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Overview
            </CardTitle>
            <CardDescription>Member workload and utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.length === 0 && (
                <p className="text-sm text-muted-foreground">No team members.</p>
              )}
              {members.map((m) => {
                const memberReqCount = requests.filter((r) => r.assigned_to === m.member?.id).length;
                const memberCompleted = requests.filter((r) => r.assigned_to === m.member?.id && r.status === "completed").length;
                const memberActive = requests.filter((r) => r.assigned_to === m.member?.id && r.status !== "completed").length;
                const pct = memberReqCount > 0 ? Math.round((memberCompleted / memberReqCount) * 100) : 0;
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50">
                    <div className="relative">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {m.member?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${memberActive > 0 ? "bg-amber-500" : "bg-green-500"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{m.member?.full_name || "Unknown"}</p>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {m.member?.role?.replace("_", " ") || ""} · {memberCompleted}/{memberReqCount} tasks
                      </p>
                      <Progress value={pct} className="mt-1 h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests & Deliverables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assigned Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Assigned Requests
            </CardTitle>
            <CardDescription>Requests assigned to your pod</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      No requests assigned.
                    </TableCell>
                  </TableRow>
                )}
                {requests.slice(0, 8).map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{request.title}</p>
                        {request.estimated_hours && (
                          <p className="text-xs text-muted-foreground">
                            {request.estimated_hours}h est.
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{request.client?.company_name || "N/A"}</TableCell>
                    <TableCell><PriorityBadge priority={request.priority} /></TableCell>
                    <TableCell><StatusBadge status={request.status} /></TableCell>
                    <TableCell className="text-sm">
                      {request.due_date ? (
                        <span className={
                          new Date(request.due_date) < new Date()
                            ? "text-destructive font-medium"
                            : new Date(request.due_date) < addDays(new Date(), 3)
                              ? "text-amber-500 font-medium"
                              : ""
                        }>
                          {format(new Date(request.due_date), "MMM d")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {requests.length > 8 && (
              <div className="mt-3 text-center">
                <Link href="/requests" className="text-sm text-primary hover:underline">
                  View all {requests.length} requests
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Recent Deliverables
            </CardTitle>
            <CardDescription>Latest deliverables for your pod</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeliverables.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No deliverables yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDeliverables.map((del) => (
                  <div key={del.id} className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{del.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <DeliverableStatusBadge status={del.status} />
                        {del.request && (
                          <span className="text-xs text-muted-foreground truncate">
                            {del.request.title}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {del.submitted_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(del.submitted_at), "MMM d")}
                        </span>
                      )}
                      {del.file_name && (
                        <a
                          href={`/api/deliverables/${del.id}/download`}
                          className="text-primary hover:text-primary/80"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {deliverables.length > 5 && (
              <div className="mt-3 text-center">
                <Link href="/deliverables" className="text-sm text-primary hover:underline">
                  View all deliverables
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Requests & Team Productivity Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Change Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Change Requests
            </CardTitle>
            <CardDescription>Pending your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {changeRequests.length === 0 && (
                <p className="text-sm text-muted-foreground">No change requests.</p>
              )}
              {changeRequests.slice(0, 5).map((cr) => (
                <div key={cr.id} className="rounded-xl border p-3 space-y-2 transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{cr.title}</p>
                    <StatusBadge status={cr.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{cr.client?.company_name || "N/A"}</span>
                    <span>
                      {cr.cost_estimate ? `$${cr.cost_estimate.toLocaleString()}` : "--"}
                      {cr.estimated_hours ? ` · ${cr.estimated_hours}h` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {changeRequests.length > 5 && (
              <div className="mt-3 text-center">
                <Link href="/change-requests" className="text-sm text-primary hover:underline">
                  View all change requests
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Productivity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Team Productivity
            </CardTitle>
            <CardDescription>Tasks completed per team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {teamProductivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamProductivity} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", boxShadow: "var(--shadow-lg)" }}
                      labelStyle={{ color: "#f5b22c" }}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill="hsl(243 75% 59%)" radius={[4, 4, 0, 0]} name="Completed" />
                    <Bar dataKey="inProgress" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} name="In Progress" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No productivity data available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines & Meetings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Requests due soon</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 5).map((r) => {
                  const dueDate = new Date(r.due_date!);
                  const isUrgent = dueDate < addDays(new Date(), 3);
                  return (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <PriorityBadge priority={r.priority} />
                          <span className="text-xs text-muted-foreground">{r.client?.company_name || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <Badge variant={isUrgent ? "destructive" : "secondary"} className="text-xs gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(dueDate, "MMM d")}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Meetings
            </CardTitle>
            <CardDescription>Scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No upcoming meetings</p>
              <p className="text-xs text-muted-foreground mt-1">
                Meeting scheduling coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Latest Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Latest Notifications
              </CardTitle>
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadNotifications} unread
                </Badge>
              )}
            </div>
            <CardDescription>Recent notifications for your account</CardDescription>
          </CardHeader>
          <CardContent>
            {latestNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No notifications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestNotifications.map((notif) => (
                  <div key={notif.id} className={`rounded-xl border p-3 transition-colors hover:bg-muted/50 ${!notif.read ? "bg-primary/5 border-primary/10" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                      {!notif.read && (
                        <Circle className="h-2 w-2 fill-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notif.created_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {notifications.length > 5 && (
              <div className="mt-3 text-center">
                <Link href="/notifications" className="text-sm text-primary hover:underline">
                  View all notifications
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest activity on your pod&apos;s requests</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={activities} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions
        actions={[
          { label: "Manage Requests", icon: ClipboardList, href: "/requests", description: "View and assign tasks" },
          { label: "Review Deliverables", icon: Package, href: "/deliverables", description: "Approve or reject submissions" },
          { label: "My Pod Team", icon: Users, href: "/my-pod", description: "Manage team members" },
          { label: "Change Requests", icon: FileText, href: "/change-requests", description: "Review change requests" },
          { label: "View Reports", icon: BarChart3, href: "/reports", description: "Pod analytics and reports" },
          { label: "Support", icon: Briefcase, href: "/support", description: "Get help and submit tickets" },
        ]}
      />
    </div>
  );
}
